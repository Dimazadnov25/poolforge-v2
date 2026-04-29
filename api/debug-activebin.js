import { Connection, PublicKey } from "@solana/web3.js";
const POOL = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6";
export default async function handler(req, res) {
  const connection = new Connection(process.env.VITE_RPC_URL, "confirmed");
  const info = await connection.getAccountInfo(new PublicKey(POOL));
  const offsets = {};
  for(let i=60;i<=100;i+=4) offsets[i]=info.data.readInt32LE(i);
  return res.status(200).json({ offsets });
}
