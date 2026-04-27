import { Connection, PublicKey } from "@solana/web3.js";

const POSITION_ADDRESS = "K5K1WgzUgtsW2DS29M6pDzGTjJcUP5tWxrQYc2r2QNi";

export default async function handler(req, res) {
  try {
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");
    const positionPubkey = new PublicKey(POSITION_ADDRESS);
    const positionInfo = await connection.getAccountInfo(positionPubkey);
    if (!positionInfo) return res.status(404).json({ error: "Position nicht gefunden" });

    // Verschiedene Offsets ausprobieren
    const offsets = {};
    for (let i = 0; i <= 100; i += 4) {
      offsets[i] = positionInfo.data.readInt32LE(i);
    }

    return res.status(200).json({
      dataLength: positionInfo.data.length,
      offsets
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
