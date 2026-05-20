import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import DLMM from '@meteora-ag/dlmm'

const RPC = process.env.VITE_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const SECRET = process.env.REBALANCE_PRIVATE_KEY
const POOL_ADDRESS = new PublicKey('5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6')
const DLMM_PROGRAM = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo')
const THRESHOLD_PCT = 0.01

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const secret = req.body?.secret || req.query?.secret
  if (secret !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' })

  try {
    if (!SECRET) return res.status(500).json({ error: 'No private key' })
    const keypair = Keypair.fromSecretKey(bs58.decode(SECRET))
    const connection = new Connection(RPC, 'confirmed')
    const wallet = keypair.publicKey

    // SOL Preis
    const priceResp = await fetch('https://api.coinbase.com/v2/prices/SOL-USD/spot')
    const priceData = await priceResp.json()
    const solPrice = parseFloat(priceData.data.amount)

    // Pool State
    const poolInfo = await connection.getAccountInfo(POOL_ADDRESS)
    if (!poolInfo) return res.status(500).json({ error: 'Pool nicht gefunden' })
    const activeBinId = poolInfo.data.readInt32LE(76)

    // Position suchen
    const accounts = await connection.getProgramAccounts(DLMM_PROGRAM, {
      filters: [{ memcmp: { offset: 40, bytes: wallet.toBase58() } }]
    })

    if (accounts.length === 0) {
      return res.json({ ok: true, status: 'Keine Position', solPrice, activeBinId })
    }

    const posAccount = accounts[0]
    const lowerBinId = posAccount.account.data.readInt32LE(7912)
    const upperBinId = posAccount.account.data.readInt32LE(7916)
    const lowerThreshold = lowerBinId + Math.ceil((upperBinId - lowerBinId) * THRESHOLD_PCT)
    const upperThreshold = upperBinId - Math.ceil((upperBinId - lowerBinId) * THRESHOLD_PCT)
    const needsRebalance = activeBinId <= lowerThreshold || activeBinId >= upperThreshold

    if (!needsRebalance) {
      return res.json({ ok: true, status: '✅ In Range', solPrice, activeBinId, lowerBinId, upperBinId })
    }

    // REBALANCE: Position schließen + neue öffnen
    const dlmmPool = await DLMM.default.create(connection, POOL_ADDRESS)

    // 1. Liquidity entfernen
    const positionPubkey = posAccount.pubkey
    const binData = await dlmmPool.getPositionsByUserAndLbPair(wallet)
    const userPosition = binData.userPositions.find(p => p.publicKey.toBase58() === positionPubkey.toBase58())

    if (!userPosition) return res.status(500).json({ error: 'Position nicht in SDK gefunden' })

    const binIdsToRemove = userPosition.positionData.positionBinData.map(b => b.binId)
    const removeTx = await dlmmPool.removeLiquidity({
      position: positionPubkey,
      user: wallet,
      binIds: binIdsToRemove,
      liquiditiesBpsToRemove: binIdsToRemove.map(() => new (await import('@meteora-ag/dlmm')).BN(10000)),
      shouldClaimAndClose: true
    })

    for (const tx of Array.isArray(removeTx) ? removeTx : [removeTx]) {
      tx.sign([keypair])
      const sig = await connection.sendRawTransaction(tx.serialize())
      await connection.confirmTransaction(sig, 'confirmed')
    }

    // 2. Neue Position zentriert auf activeBin
    const binRange = upperBinId - lowerBinId
    const newLower = activeBinId - Math.floor(binRange / 2)
    const newUpper = activeBinId + Math.floor(binRange / 2)

    const solBalance = await connection.getBalance(wallet)
    const solAmount = Math.floor((solBalance - 5000000) / 2) // 0.005 SOL Reserve
    const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
    const usdcAta = await connection.getTokenAccountsByOwner(wallet, { mint: usdcMint })
    const usdcBalance = usdcAta.value.length > 0
      ? Number((await connection.getTokenAccountBalance(usdcAta.value[0].pubkey)).value.amount)
      : 0

    const newPosition = Keypair.generate()
    const { BN } = await import('@meteora-ag/dlmm')
    const addTx = await dlmmPool.initializePositionAndAddLiquidityByStrategy({
      positionPubKey: newPosition.publicKey,
      user: wallet,
      totalXAmount: new BN(solAmount),
      totalYAmount: new BN(usdcBalance),
      strategy: {
        maxBinId: newUpper,
        minBinId: newLower,
        strategyType: 2 // Spot
      }
    })

    addTx.sign([keypair, newPosition])
    const addSig = await connection.sendRawTransaction(addTx.serialize())
    await connection.confirmTransaction(addSig, 'confirmed')

    return res.json({
      ok: true,
      status: '🔄 Rebalanced!',
      solPrice,
      activeBinId,
      oldRange: { lowerBinId, upperBinId },
      newRange: { newLower, newUpper },
      newPosition: newPosition.publicKey.toBase58()
    })

  } catch(e) {
    res.status(500).json({ error: e.message, stack: e.stack?.substring(0, 200) })
  }
}