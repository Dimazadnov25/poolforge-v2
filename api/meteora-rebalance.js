import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const OWNER = "BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj";
const POOL_ADDRESS = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6";

export default async function handler(req, res) {
  try {
    const raw = process.env.REBALANCE_PRIVATE_KEY || '';
    
    if (!raw || raw.length < 10) {
      return res.status(200).json({ error: "Key leer", length: raw.length });
    }

    const cleaned = raw.replace(/\s/g, '').replace(/\n/g, '').replace(/\r/g, '');
    
    let PRIVATE_KEY;
    try {
      PRIVATE_KEY = JSON.parse(cleaned);
    } catch(e) {
      return res.status(200).json({ 
        error: "Parse failed", 
        msg: e.message,
        length: cleaned.length,
        first20: cleaned.substring(0, 20),
        last5: cleaned.substring(cleaned.length - 5)
      });
    }

    const rebalanceKeypair = Keypair.fromSecretKey(Uint8Array.from(PRIVATE_KEY));
    
    return res.status(200).json({
      status: "ok",
      rebalanceWallet: rebalanceKeypair.publicKey.toBase58(),
      keyLength: PRIVATE_KEY.length
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
