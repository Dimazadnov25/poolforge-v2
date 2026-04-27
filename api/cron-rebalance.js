import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const POOL_ADDRESS = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6";
const POSITION_ADDRESS = "K5K1WgzUgtsW2DS29M6pDzGTjJcUP5tWxrQYc2r2QNi";
const BIN_SPREAD = 4;

export default async function handler(req, res) {
  // Sicherheit - nur Vercel Cron darf das aufrufen
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const raw = process.env.REBALANCE_PRIVATE_KEY || '';
    const PRIVATE_KEY = JSON.parse(raw.replace(/\s/g, ''));
    const rebalanceKeypair = Keypair.fromSecretKey(Uint8Array.from(PRIVATE_KEY));
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");

    const poolInfo = await connection.getAccountInfo(new PublicKey(POOL_ADDRESS));
    const positionInfo = await connection.getAccountInfo(new PublicKey(POSITION_ADDRESS));

    const activeBin = poolInfo.data.readInt32LE(76);
    const lowerBinId = positionInfo.data.readInt32LE(7912);
    const upperBinId = positionInfo.data.readInt32LE(7916);

    const inRange = activeBin >= lowerBinId && activeBin <= upperBinId;

    if (inRange) {
      return res.status(200).json({
        status: "in_range",
        activeBin,
        position: { lower: lowerBinId, upper: upperBinId },
        message: "Kein Rebalance nötig"
      });
    }

    // Rebalance nötig - neue Range berechnen
    const newLower = activeBin - BIN_SPREAD;
    const newUpper = activeBin + BIN_SPREAD;

    return res.status(200).json({
      status: "needs_rebalance",
      activeBin,
      currentPosition: { lower: lowerBinId, upper: upperBinId },
      newRange: { lower: newLower, upper: newUpper },
      message: "Rebalance wird ausgeführt - kommt in nächstem Schritt"
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
