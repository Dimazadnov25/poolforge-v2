import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const OWNER = new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj");
const POOL_ADDRESS = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6";
const POSITION_ADDRESS = "K5K1WgzUgtsW2DS29M6pDzGTjJcUP5tWxrQYc2r2QNi";
const BIN_SPREAD = 2;

export default async function handler(req, res) {
  try {
    const raw = process.env.REBALANCE_PRIVATE_KEY || '';
    const PRIVATE_KEY = JSON.parse(raw.replace(/\s/g, ''));
    const rebalanceKeypair = Keypair.fromSecretKey(Uint8Array.from(PRIVATE_KEY));
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");

    // Aktiven Bin on-chain lesen
    const poolPubkey = new PublicKey(POOL_ADDRESS);
    const accountInfo = await connection.getAccountInfo(poolPubkey);
    if (!accountInfo) return res.status(404).json({ error: "Pool nicht gefunden" });
    const activeBin = accountInfo.data.readInt32LE(70);

    // Position lesen
    const positionPubkey = new PublicKey(POSITION_ADDRESS);
    const positionInfo = await connection.getAccountInfo(positionPubkey);
    if (!positionInfo) return res.status(404).json({ error: "Position nicht gefunden" });

    // Position Range lesen (lowerBinId bei Offset 40, upperBinId bei 44)
    const lowerBinId = positionInfo.data.readInt32LE(40);
    const upperBinId = positionInfo.data.readInt32LE(44);

    // Prüfen ob Rebalance nötig
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
