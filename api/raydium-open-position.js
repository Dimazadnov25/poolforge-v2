import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction } from '@solana/spl-token'
import crypto from 'crypto'

const RPC = process.env.HELIUS_RPC || 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const CLMM_PROGRAM   = new PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK')
const SOL_USDC_POOL  = new PublicKey('2QdhepnKRTLjjSqPL1PtKNwqrUkoLee5Gqs8bvZhRdMv')
const METADATA_PROG  = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

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

function getStartTickIndex(tick, tickSpacing) {
  const TICK_ARRAY_SIZE = 60
  const ticks = tickSpacing * TICK_ARRAY_SIZE
  return Math.floor(tick / ticks) * ticks
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' })

  try {
    const { wallet, nftMint, tickLower, tickUpper } = req.body
    if (!wallet || !nftMint || tickLower === undefined || tickUpper === undefined)
      return res.status(400).json({ error: 'wallet, nftMint, tickLower, tickUpper required' })

    const conn = new Connection(RPC, 'confirmed')
    const walletPK = new PublicKey(wallet)
    const nftMintPK = new PublicKey(nftMint)

    const poolInfo = await conn.getAccountInfo(SOL_USDC_POOL)
    const tickSpacing = poolInfo.data.readUInt16LE(235)

    const [positionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('position'), nftMintPK.toBuffer()],
      CLMM_PROGRAM
    )
    const [protocolPositionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('position'), SOL_USDC_POOL.toBuffer(),
       (() => { const b = Buffer.alloc(8); b.writeInt32LE(tickLower,0); b.writeInt32LE(tickUpper,4); return b })()],
      CLMM_PROGRAM
    )

    const TICK_ARRAY_SIZE = 60
    const startLower = Math.floor(tickLower / (tickSpacing * TICK_ARRAY_SIZE)) * (tickSpacing * TICK_ARRAY_SIZE)
    const startUpper = Math.floor(tickUpper / (tickSpacing * TICK_ARRAY_SIZE)) * (tickSpacing * TICK_ARRAY_SIZE)
    const tickArrayLower = getTickArrayPDA(SOL_USDC_POOL, startLower)
    const tickArrayUpper = getTickArrayPDA(SOL_USDC_POOL, startUpper)

    const nftAta = getAssociatedTokenAddressSync(nftMintPK, walletPK)
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), METADATA_PROG.toBuffer(), nftMintPK.toBuffer()],
      METADATA_PROG
    )

    const disc = discriminator('open_position')
    const data = Buffer.alloc(16)
    disc.copy(data, 0)
    data.writeInt32LE(tickLower, 8)
    data.writeInt32LE(tickUpper, 12)

    const ix = new TransactionInstruction({
      programId: CLMM_PROGRAM,
      data,
      keys: [
        { pubkey: walletPK,            isSigner: true,  isWritable: true  },
        { pubkey: SOL_USDC_POOL,       isSigner: false, isWritable: true  },
        { pubkey: protocolPositionPDA, isSigner: false, isWritable: true  },
        { pubkey: nftMintPK,           isSigner: true,  isWritable: true  },
        { pubkey: nftAta,              isSigner: false, isWritable: true  },
        { pubkey: positionPDA,         isSigner: false, isWritable: true  },
        { pubkey: tickArrayLower,      isSigner: false, isWritable: true  },
        { pubkey: tickArrayUpper,      isSigner: false, isWritable: true  },
        { pubkey: metadataPDA,         isSigner: false, isWritable: true  },
        { pubkey: SystemProgram.programId,     isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID,            isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: METADATA_PROG,               isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY,          isSigner: false, isWritable: false },
      ]
    })

    const { blockhash } = await conn.getLatestBlockhash()
    const tx = new Transaction({ feePayer: walletPK, recentBlockhash: blockhash })
    tx.add(ix)

    const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false })
    res.json({
      tx: Buffer.from(serialized).toString('base64'),
      positionPDA: positionPDA.toBase58(),
      tickArrayLower: tickArrayLower.toBase58(),
      tickArrayUpper: tickArrayUpper.toBase58(),
      tickSpacing
    })
  } catch(e) {
    res.status(500).json({ error: e.message, stack: e.stack })
  }
}
