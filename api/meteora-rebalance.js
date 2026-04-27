import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const RPC = process.env.VITE_RPC_URL;
const PRIVATE_KEY = JSON.parse(process.env.REBALANCE_PRIVATE_KEY.replace(/\s/g, ''));

// Dein Haupt-Wallet (besitzt die Position)
const OWNER = new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj");

// Rebalance-Wallet (zahlt TX-Gebühren)
const rebalanceKeypair = Keypair.fromSecretKey(Uint8Array.from(PRIVATE_KEY));

const BIN_SPREAD = 10; // ±10 Bins um aktuellen Preis

export default async function handler(req, res) {
  try {
    const connection = new Connection(RPC, "confirmed");

    // 1. Pool-Info holen (aktiver Bin)
    const poolAddress = req.body?.poolAddress;
    if (!poolAddress) {
      return res.status(400).json({ error: "poolAddress fehlt" });
    }

    // 2. Aktiven Bin vom Pool holen
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
