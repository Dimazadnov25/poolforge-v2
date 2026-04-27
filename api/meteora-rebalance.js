import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const OWNER = new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj");
const BIN_SPREAD = 10;

export default async function handler(req, res) {
  try {
    const raw = process.env.REBALANCE_PRIVATE_KEY || '';
    const PRIVATE_KEY = JSON.parse(raw.replace(/\s/g, ''));
    const rebalanceKeypair = Keypair.fromSecretKey(Uint8Array.from(PRIVATE_KEY));
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const poolAddress = body?.poolAddress;
    if (!poolAddress) {
      return res.status(400).json({ error: "poolAddress fehlt" });
    }

    // Aktiven Bin direkt on-chain lesen (kein externes API nötig)
    const poolPubkey = new PublicKey(poolAddress);
    const accountInfo = await connection.getAccountInfo(poolPubkey);
    if (!accountInfo) {
      return res.status(404).json({ error: "Pool nicht gefunden" });
    }

    // activeId ist bei Offset 70 gespeichert (4 bytes, little-endian int32)
    const activeBin = accountInfo.data.readInt32LE(70);
    const newBinLower = activeBin - BIN_SPREAD;
    const newBinUpper = activeBin + BIN_SPREAD;

    return res.status(200).json({
      status: "ok",
      activeBin,
      newRange: { lower: newBinLower, upper: newBinUpper },
      rebalanceWallet: rebalanceKeypair.publicKey.toBase58(),
      owner: OWNER.toBase58(),
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
