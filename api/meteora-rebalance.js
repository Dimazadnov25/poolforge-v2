import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const OWNER = new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj");
const BIN_SPREAD = 10;

export default async function handler(req, res) {
  try {
    const raw = process.env.REBALANCE_PRIVATE_KEY;
    const PRIVATE_KEY = JSON.parse(raw.replace(/\s/g, ''));
    const rebalanceKeypair = Keypair.fromSecretKey(Uint8Array.from(PRIVATE_KEY));
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const poolAddress = body?.poolAddress;
    if (!poolAddress) {
      return res.status(400).json({ error: "poolAddress fehlt" });
    }

    const poolInfo = await fetch(
      `https://dlmm-api.meteora.ag/pair/${poolAddress}`
    ).then((r) => r.json());

    const activeBin = poolInfo.active_bin_id;
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