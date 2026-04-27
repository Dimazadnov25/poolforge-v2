import { Connection, PublicKey } from "@solana/web3.js";

const POSITION_ADDRESS = "K5K1WgzUgtsW2DS29M6pDzGTjJcUP5tWxrQYc2r2QNi";

export default async function handler(req, res) {
  try {
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");
    const positionInfo = await connection.getAccountInfo(new PublicKey(POSITION_ADDRESS));

    // Suche nach -6221 und -6153 in den Daten
    const results = {};
    for (let i = 0; i <= positionInfo.data.length - 4; i += 4) {
      const val = positionInfo.data.readInt32LE(i);
      if (val === -6221 || val === -6153 || val === -6179) {
        results[i] = val;
      }
    }

    return res.status(200).json({ results });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
