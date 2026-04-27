import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const OWNER = "BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj";
const POOL_ADDRESS = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6";
const POSITION_ADDRESS = "K5K1WgzUgtsW2DS29M6pDzGTjJcUP5tWxrQYc2r2QNi";

export default async function handler(req, res) {
  try {
    const raw = process.env.REBALANCE_PRIVATE_KEY || '';
    const cleaned = raw.replace(/\s/g, '');
    const PRIVATE_KEY = JSON.parse(cleaned);
    const rebalanceKeypair = Keypair.fromSecretKey(Uint8Array.from(PRIVATE_KEY));
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");

    // Pool aktiven Bin lesen - alle möglichen Offsets testen
    const poolInfo = await connection.getAccountInfo(new PublicKey(POOL_ADDRESS));
    const positionInfo = await connection.getAccountInfo(new PublicKey(POSITION_ADDRESS));

    // Pool: activeId bei verschiedenen Offsets
    const poolOffsets = {};
    for (let i = 60; i <= 90; i += 4) {
      poolOffsets[i] = poolInfo.data.readInt32LE(i);
    }

    // Position: lowerBinId bei verschiedenen Offsets  
    const posOffsets = {};
    for (let i = 72; i <= 108; i += 4) {
      posOffsets[i] = positionInfo.data.readInt32LE(i);
    }

    return res.status(200).json({
      rebalanceWallet: rebalanceKeypair.publicKey.toBase58(),
      poolOffsets,
      posOffsets,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
