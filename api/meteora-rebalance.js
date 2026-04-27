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

    const poolInfo = await connection.getAccountInfo(new PublicKey(POOL_ADDRESS));
    const positionInfo = await connection.getAccountInfo(new PublicKey(POSITION_ADDRESS));

    // Aktiver Bin bei Offset 76
    const activeBin = poolInfo.data.readInt32LE(76);

    // Position Range
    const lowerBinId = positionInfo.data.readInt32LE(392);
    const upperBinId = positionInfo.data.readInt32LE(396);

    const inRange = activeBin >= lowerBinId && activeBin <= upperBinId;

    return res.status(200).json({
      status: inRange ? "in_range" : "needs_rebalance",
      activeBin,
      position: { lower: lowerBinId, upper: upperBinId },
      rebalanceWallet: rebalanceKeypair.publicKey.toBase58(),
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
