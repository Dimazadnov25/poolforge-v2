const fs = require('fs')

const content = `import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import crypto from 'crypto'

const RPC = process.env.HELIUS_RPC || 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const CLMM_PROGRAM  = new PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK')
const SOL_USDC_POOL = new PublicKey('2QdhepnKRTLjjSqPL1PtKNwqrUkoLee5Gqs8bvZhRdMv')
const SOL_MINT      = new PublicKey('So11111111111111111111111111111111111111112')
const USDC_MINT     = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

function discriminator(name) {
  return crypto.createHash('sha256').update('global:' + name).digest().slice(0, 8)
}

function getTickArrayPDA(poolId, startIndex) {
  const buf = Buffer.alloc(4)
  buf.writeInt32LE(startIndex, 0)
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('tick_array'), poolId.toBuffer(), buf],
    CLMM_PROGRAM
  )
  return pda
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' })

  try {
    const { wallet, nftMint, positionPDA, tickLower, tickUpper,
            liquidityAmount, amount0Max, amount1Max } = req.body

    if (!wallet || !nftMint || !positionPDA || tickLower === undefined || tickUpper === undefined)
      return res.status(400).json({ error: 'wallet, nftMint, positionPDA, tickLower, tickUpper required' })

    const conn = new Connection(RPC, 'confirmed')
    const walletPK     = new PublicKey(wallet)
    const nftMintPK    = new PublicKey(nftMint)
    const positionPK   = new PublicKey(positionPDA)

    // Pool state fuer tickSpacing + vaults
    const poolInfo = await conn.getAccountInfo(SOL_USDC_POOL)
    const d = poolInfo.data
    const tickSpacing = d.readUInt16LE(235)
    const tickCurrent = d.readInt32LE(269)
    const vaultA = new PublicKey(d.slice(137, 169))
    const vaultB = new PublicKey(d.slice(169, 201))

    // Tick Arrays
    const TICK_ARRAY_SIZE = 60
    const ticks = tickSpacing * TICK_ARRAY_SIZE
    const startLower   = Math.floor(tickLower   / ticks) * ticks
    const startUpper   = Math.floor(tickUpper   / ticks) * ticks
    const startCurrent = Math.floor(tickCurrent / ticks) * ticks
    const tickArrayLower   = getTickArrayPDA(SOL_USDC_POOL, startLower)
    const tickArrayUpper   = getTickArrayPDA(SOL_USDC_POOL, startUpper)
    const tickArrayCurrent = getTickArrayPDA(SOL_USDC_POOL, startCurrent)

    // Protocol position PDA
    const [protocolPositionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('position'), SOL_USDC_POOL.toBuffer(),
       (() => { const b = Buffer.alloc(8); b.writeInt32LE(tickLower,0); b.writeInt32LE(tickUpper,4); return b })()],
      CLMM_PROGRAM
    )

    // User token ATAs
    const nftAta  = getAssociatedTokenAddressSync(nftMintPK, walletPK)
    const ataSOL  = getAssociatedTokenAddressSync(SOL_MINT,  walletPK)
    const ataUSDC = getAssociatedTokenAddressSync(USDC_MINT, walletPK)

    // Liquidity als u128 (16 bytes LE)
    const liq = BigInt(liquidityAmount || '1000000')
    const amt0 = BigInt(amount0Max    || '999999999999')
    const amt1 = BigInt(amount1Max    || '999999999999')

    // Instruction data: discriminator(8) + liquidity(16) + amount0Max(8) + amount1Max(8) + base_flag(1)
    const disc = discriminator('increase_liquidity_v2')
    const data = Buffer.alloc(8 + 16 + 8 + 8 + 1)
    disc.copy(data, 0)
    // u128 liquidity LE
    data.writeBigUInt64LE(liq & BigInt('0xFFFFFFFFFFFFFFFF'), 8)
    data.writeBigUInt64LE(liq >> BigInt(64), 16)
    // u64 amount0Max, amount1Max
    data.writeBigUInt64LE(amt0, 24)
    data.writeBigUInt64LE(amt1, 32)
    // base_flag: 0 = liquidity-based
    data.writeUInt8(0, 40)

    const ix = new TransactionInstruction({
      programId: CLMM_PROGRAM,
      data,
      keys: [
        { pubkey: walletPK,            isSigner: true,  isWritable: true  },
        { pubkey: SOL_USDC_POOL,       isSigner: false, isWritable: true  },
        { pubkey: protocolPositionPDA, isSigner: false, isWritable: true  },
        { pubkey: positionPK,          isSigner: false, isWritable: true  },
        { pubkey: tickArrayLower,      isSigner: false, isWritable: true  },
        { pubkey: tickArrayUpper,      isSigner: false, isWritable: true  },
        { pubkey: nftAta,              isSigner: false, isWritable: false },
        { pubkey: ataSOL,              isSigner: false, isWritable: true  },
        { pubkey: ataUSDC,             isSigner: false, isWritable: true  },
        { pubkey: vaultA,              isSigner: false, isWritable: true  },
        { pubkey: vaultB,              isSigner: false, isWritable: true  },
        { pubkey: tickArrayCurrent,    isSigner: false, isWritable: true  },
        { pubkey: TOKEN_PROGRAM_ID,    isSigner: false, isWritable: false },
        { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      ]
    })

    const { blockhash } = await conn.getLatestBlockhash()
    const tx = new Transaction({ feePayer: walletPK, recentBlockhash: blockhash })
    tx.add(ix)

    const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false })
    res.json({
      tx: Buffer.from(serialized).toString('base64'),
      tickArrayLower: tickArrayLower.toBase58(),
      tickArrayUpper: tickArrayUpper.toBase58(),
      tickArrayCurrent: tickArrayCurrent.toBase58(),
      tickCurrent
    })
  } catch(e) {
    res.status(500).json({ error: e.message, stack: e.stack })
  }
}
`

fs.writeFileSync('api/raydium-add-liquidity.js', content)
console.log('✅ api/raydium-add-liquidity.js erstellt')