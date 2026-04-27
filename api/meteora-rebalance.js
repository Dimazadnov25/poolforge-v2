import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const OWNER = "BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj";
const POOL_ADDRESS = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6";

export default async function handler(req, res) {
  try {
    const raw = process.env.REBALANCE_PRIVATE_KEY || '';
    const cleaned = raw.replace(/\s/g, '').replace(/\n/g, '').replace(/\r/g, '');
    const PRIVATE_KEY = JSON.parse(cleaned);
    const rebalanceKeypair = Keypair.fromSecretKey(Uint8Array.from(PRIVATE_KEY));
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");

    // Aktiven Bin on-chain lesen
    const poolPubkey = new PublicKey(POOL_ADDRESS);
    const accountInfo = await connection.getAccountInfo(poolPubkey);
    if (!accountInfo) return res.status(404).json({ error: "Pool nicht gefunden" });
    const activeBin = accountInfo.data.readInt32LE(70);

    // Position über datapi lesen
    const positionsResp = await fetch(
      `https://dlmm.datapi.meteora.ag/wallet/${OWNER}/positions`
    ).then(r => r.json());

    return res.status(200).json({
      status: "ok",
      activeBin,
      positions: positionsResp,
      rebalanceWallet: rebalanceKeypair.publicKey.toBase58(),
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
