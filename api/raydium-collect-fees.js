import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' })
  try {
    const { wallet, nftMint, positionPDA } = req.body
    if (!wallet || !nftMint || !positionPDA)
      return res.status(400).json({ error: 'wallet, nftMint, positionPDA required' })

    const conn = new Connection(RPC, 'confirmed')
    const walletPK   = new PublicKey(wallet)
    const nftMintPK  = new PublicKey(nftMint)
    const positionPK = new PublicKey(positionPDA)

    const poolInfo = await conn.getAccountInfo(SOL_USDC_POOL)
    const d = poolInfo.data
    const vaultA = new PublicKey(d.slice(137, 169))
    const vaultB = new PublicKey(d.slice(169, 201))

    const nftAta  = getAssociatedTokenAddressSync(nftMintPK, walletPK)
    const ataSOL  = getAssociatedTokenAddressSync(SOL_MINT,  walletPK)
    const ataUSDC = getAssociatedTokenAddressSync(USDC_MINT, walletPK)

    // amount0Requested + amount1Requested = u64 max
    const MAX = BigInt('18446744073709551615')
    const disc = discriminator('collect_remaining_rewards')
    // collect_fee discriminator
    const discFee = crypto.createHash('sha256').update('global:collect_fee').digest().slice(0, 8)
    const data = Buffer.alloc(8 + 8 + 8)
    discFee.copy(data, 0)
    data.writeBigUInt64LE(MAX, 8)
    data.writeBigUInt64LE(MAX, 16)

    const ix = new TransactionInstruction({
      programId: CLMM_PROGRAM,
      data,
      keys: [
        { pubkey: walletPK,         isSigner: true,  isWritable: true  },
        { pubkey: SOL_USDC_POOL,    isSigner: false, isWritable: true  },
        { pubkey: positionPK,       isSigner: false, isWritable: true  },
        { pubkey: nftAta,           isSigner: false, isWritable: false },
        { pubkey: ataSOL,           isSigner: false, isWritable: true  },
        { pubkey: ataUSDC,          isSigner: false, isWritable: true  },
        { pubkey: vaultA,           isSigner: false, isWritable: true  },
        { pubkey: vaultB,           isSigner: false, isWritable: true  },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      ]
    })

    const { blockhash } = await conn.getLatestBlockhash()
    const tx = new Transaction({ feePayer: walletPK, recentBlockhash: blockhash })
    tx.add(ix)
    const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false })
    res.json({ tx: Buffer.from(serialized).toString('base64') })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}
