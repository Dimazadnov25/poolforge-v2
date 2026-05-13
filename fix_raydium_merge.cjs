const fs = require('fs')

// Alte einzelne Raydium Files loeschen
const toDelete = [
  'api/raydium-pool-state.js',
  'api/raydium-open-position.js', 
  'api/raydium-add-liquidity.js',
  'api/raydium-collect-fees.js',
  'api/raydium-close-position.js'
]
toDelete.forEach(f => { if(fs.existsSync(f)) fs.unlinkSync(f); console.log('❌ geloescht:', f) })

const content = `import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import crypto from 'crypto'

const RPC = process.env.HELIUS_RPC || 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const CLMM_PROGRAM  = new PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK')
const SOL_USDC_POOL = new PublicKey('2QdhepnKRTLjjSqPL1PtKNwqrUkoLee5Gqs8bvZhRdMv')
const SOL_MINT      = new PublicKey('So11111111111111111111111111111111111111112')
const USDC_MINT     = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
const METADATA_PROG = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

const disc = name => crypto.createHash('sha256').update('global:' + name).digest().slice(0, 8)

function getTickArrayPDA(poolId, startIndex) {
  const buf = Buffer.alloc(4); buf.writeInt32LE(startIndex, 0)
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from('tick_array'), poolId.toBuffer(), buf], CLMM_PROGRAM)
  return pda
}

function getStartTick(tick, tickSpacing) {
  const size = tickSpacing * 60
  return Math.floor(tick / size) * size
}

async function poolState(conn) {
  const info = await conn.getAccountInfo(SOL_USDC_POOL)
  const d = info.data
  const tickSpacing = d.readUInt16LE(235)
  const tickCurrent = d.readInt32LE(269)
  const sqrtPriceX64 = BigInt('0x' + Buffer.from(d.slice(253, 269)).reverse().toString('hex'))
  const sqrtPrice = Number(sqrtPriceX64) / Math.pow(2, 64)
  const price = (sqrtPrice * sqrtPrice) * Math.pow(10, 3)
  const vaultA = new PublicKey(d.slice(137, 169))
  const vaultB = new PublicKey(d.slice(169, 201))
  return { tickSpacing, tickCurrent, price, vaultA, vaultB }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const conn = new Connection(RPC, 'confirmed')

  // GET = pool state lesen
  if (req.method === 'GET') {
    try {
      const ps = await poolState(conn)
      return res.json({ pool: SOL_USDC_POOL.toBase58(), ...ps, vaultA: ps.vaultA.toBase58(), vaultB: ps.vaultB.toBase58() })
    } catch(e) { return res.status(500).json({ error: e.message }) }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'GET or POST required' })

  const { action, wallet, nftMint, positionPDA, tickLower, tickUpper, liquidityAmount, amount0Max, amount1Max } = req.body

  try {
    const walletPK = new PublicKey(wallet)
    const ps = await poolState(conn)
    let tx = new Transaction()
    const { blockhash } = await conn.getLatestBlockhash()
    tx.recentBlockhash = blockhash
    tx.feePayer = walletPK

    if (action === 'openPosition') {
      const nftMintPK = new PublicKey(nftMint)
      const [posPDA] = PublicKey.findProgramAddressSync([Buffer.from('position'), nftMintPK.toBuffer()], CLMM_PROGRAM)
      const [protoPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('position'), SOL_USDC_POOL.toBuffer(), (() => { const b=Buffer.alloc(8); b.writeInt32LE(tickLower,0); b.writeInt32LE(tickUpper,4); return b })()],
        CLMM_PROGRAM)
      const tickArrayLower = getTickArrayPDA(SOL_USDC_POOL, getStartTick(tickLower, ps.tickSpacing))
      const tickArrayUpper = getTickArrayPDA(SOL_USDC_POOL, getStartTick(tickUpper, ps.tickSpacing))
      const nftAta = getAssociatedTokenAddressSync(nftMintPK, walletPK)
      const [metaPDA] = PublicKey.findProgramAddressSync([Buffer.from('metadata'), METADATA_PROG.toBuffer(), nftMintPK.toBuffer()], METADATA_PROG)
      const data = Buffer.alloc(16); disc('open_position').copy(data,0); data.writeInt32LE(tickLower,8); data.writeInt32LE(tickUpper,12)
      tx.add(new TransactionInstruction({ programId: CLMM_PROGRAM, data, keys: [
        {pubkey:walletPK,isSigner:true,isWritable:true},{pubkey:SOL_USDC_POOL,isSigner:false,isWritable:true},
        {pubkey:protoPDA,isSigner:false,isWritable:true},{pubkey:nftMintPK,isSigner:true,isWritable:true},
        {pubkey:nftAta,isSigner:false,isWritable:true},{pubkey:posPDA,isSigner:false,isWritable:true},
        {pubkey:tickArrayLower,isSigner:false,isWritable:true},{pubkey:tickArrayUpper,isSigner:false,isWritable:true},
        {pubkey:metaPDA,isSigner:false,isWritable:true},{pubkey:SystemProgram.programId,isSigner:false,isWritable:false},
        {pubkey:TOKEN_PROGRAM_ID,isSigner:false,isWritable:false},{pubkey:ASSOCIATED_TOKEN_PROGRAM_ID,isSigner:false,isWritable:false},
        {pubkey:METADATA_PROG,isSigner:false,isWritable:false},{pubkey:SYSVAR_RENT_PUBKEY,isSigner:false,isWritable:false},
      ]}))
      const serialized = tx.serialize({requireAllSignatures:false,verifySignatures:false})
      return res.json({ tx: Buffer.from(serialized).toString('base64'), positionPDA: posPDA.toBase58(), tickArrayLower: tickArrayLower.toBase58(), tickArrayUpper: tickArrayUpper.toBase58(), tickSpacing: ps.tickSpacing })
    }

    if (action === 'addLiquidity') {
      const nftMintPK = new PublicKey(nftMint)
      const positionPK = new PublicKey(positionPDA)
      const [protoPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('position'), SOL_USDC_POOL.toBuffer(), (() => { const b=Buffer.alloc(8); b.writeInt32LE(tickLower,0); b.writeInt32LE(tickUpper,4); return b })()],
        CLMM_PROGRAM)
      const tickArrayLower   = getTickArrayPDA(SOL_USDC_POOL, getStartTick(tickLower, ps.tickSpacing))
      const tickArrayUpper   = getTickArrayPDA(SOL_USDC_POOL, getStartTick(tickUpper, ps.tickSpacing))
      const tickArrayCurrent = getTickArrayPDA(SOL_USDC_POOL, getStartTick(ps.tickCurrent, ps.tickSpacing))
      const nftAta  = getAssociatedTokenAddressSync(nftMintPK, walletPK)
      const ataSOL  = getAssociatedTokenAddressSync(SOL_MINT,  walletPK)
      const ataUSDC = getAssociatedTokenAddressSync(USDC_MINT, walletPK)
      const liq  = BigInt(liquidityAmount || '1000000')
      const amt0 = BigInt(amount0Max || '999999999999')
      const amt1 = BigInt(amount1Max || '999999999999')
      const data = Buffer.alloc(41)
      disc('increase_liquidity_v2').copy(data,0)
      data.writeBigUInt64LE(liq & BigInt('0xFFFFFFFFFFFFFFFF'), 8)
      data.writeBigUInt64LE(liq >> BigInt(64), 16)
      data.writeBigUInt64LE(amt0, 24); data.writeBigUInt64LE(amt1, 32); data.writeUInt8(0, 40)
      tx.add(new TransactionInstruction({ programId: CLMM_PROGRAM, data, keys: [
        {pubkey:walletPK,isSigner:true,isWritable:true},{pubkey:SOL_USDC_POOL,isSigner:false,isWritable:true},
        {pubkey:protoPDA,isSigner:false,isWritable:true},{pubkey:positionPK,isSigner:false,isWritable:true},
        {pubkey:tickArrayLower,isSigner:false,isWritable:true},{pubkey:tickArrayUpper,isSigner:false,isWritable:true},
        {pubkey:nftAta,isSigner:false,isWritable:false},{pubkey:ataSOL,isSigner:false,isWritable:true},
        {pubkey:ataUSDC,isSigner:false,isWritable:true},{pubkey:ps.vaultA,isSigner:false,isWritable:true},
        {pubkey:ps.vaultB,isSigner:false,isWritable:true},{pubkey:tickArrayCurrent,isSigner:false,isWritable:true},
        {pubkey:TOKEN_PROGRAM_ID,isSigner:false,isWritable:false},{pubkey:TOKEN_2022_PROGRAM_ID,isSigner:false,isWritable:false},
      ]}))
      const serialized = tx.serialize({requireAllSignatures:false,verifySignatures:false})
      return res.json({ tx: Buffer.from(serialized).toString('base64'), tickCurrent: ps.tickCurrent })
    }

    if (action === 'collectFees') {
      const nftMintPK = new PublicKey(nftMint)
      const positionPK = new PublicKey(positionPDA)
      const nftAta  = getAssociatedTokenAddressSync(nftMintPK, walletPK)
      const ataSOL  = getAssociatedTokenAddressSync(SOL_MINT,  walletPK)
      const ataUSDC = getAssociatedTokenAddressSync(USDC_MINT, walletPK)
      const MAX = BigInt('18446744073709551615')
      const data = Buffer.alloc(24)
      disc('collect_fee').copy(data,0)
      data.writeBigUInt64LE(MAX,8); data.writeBigUInt64LE(MAX,16)
      tx.add(new TransactionInstruction({ programId: CLMM_PROGRAM, data, keys: [
        {pubkey:walletPK,isSigner:true,isWritable:true},{pubkey:SOL_USDC_POOL,isSigner:false,isWritable:true},
        {pubkey:positionPK,isSigner:false,isWritable:true},{pubkey:nftAta,isSigner:false,isWritable:false},
        {pubkey:ataSOL,isSigner:false,isWritable:true},{pubkey:ataUSDC,isSigner:false,isWritable:true},
        {pubkey:ps.vaultA,isSigner:false,isWritable:true},{pubkey:ps.vaultB,isSigner:false,isWritable:true},
        {pubkey:TOKEN_PROGRAM_ID,isSigner:false,isWritable:false},{pubkey:TOKEN_2022_PROGRAM_ID,isSigner:false,isWritable:false},
      ]}))
      const serialized = tx.serialize({requireAllSignatures:false,verifySignatures:false})
      return res.json({ tx: Buffer.from(serialized).toString('base64') })
    }

    if (action === 'closePosition') {
      const nftMintPK = new PublicKey(nftMint)
      const positionPK = new PublicKey(positionPDA)
      const nftAta = getAssociatedTokenAddressSync(nftMintPK, walletPK)
      const data = Buffer.from(disc('close_position'))
      tx.add(new TransactionInstruction({ programId: CLMM_PROGRAM, data, keys: [
        {pubkey:walletPK,isSigner:true,isWritable:true},{pubkey:positionPK,isSigner:false,isWritable:true},
        {pubkey:nftMintPK,isSigner:false,isWritable:true},{pubkey:nftAta,isSigner:false,isWritable:true},
        {pubkey:TOKEN_PROGRAM_ID,isSigner:false,isWritable:false},
      ]}))
      const serialized = tx.serialize({requireAllSignatures:false,verifySignatures:false})
      return res.json({ tx: Buffer.from(serialized).toString('base64') })
    }

    return res.status(400).json({ error: 'action must be: openPosition | addLiquidity | collectFees | closePosition' })

  } catch(e) {
    res.status(500).json({ error: e.message, stack: e.stack })
  }
}
`

fs.writeFileSync('api/raydium.js', content)
console.log('✅ api/raydium.js erstellt (alle 5 Routes zusammengefasst)')