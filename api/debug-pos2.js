import { Connection, PublicKey } from "@solana/web3.js";
const POSITION2 = "MkajHWsrmJrHpgxq6z64M26GDiGKazjSmpSaJnX5S1p";
export default async function handler(req, res) {
  const connection = new Connection(process.env.VITE_RPC_URL, "confirmed");
  const info = await connection.getAccountInfo(new PublicKey(POSITION2));
  const results = {};
  for(let i=0;i<=info.data.length-4;i+=4){
    const val = info.data.readInt32LE(i);
    if(val===-6200||val===-6196||val===-6203) results[i]=val;
  }
  return res.status(200).json({results, dataLength: info.data.length});
}
