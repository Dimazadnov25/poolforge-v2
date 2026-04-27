import { Connection, PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { AnchorProvider, Program, BN, Wallet } from "@coral-xyz/anchor";

const DLMM_PROGRAM_ID = new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo");
const POOL_ADDRESS = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6";
const BIN_SPREAD = 10;

export default async function handler(req, res) {
  try {
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");

    // Pool on-chain lesen
    const poolPubkey = new PublicKey(POOL_ADDRESS);
    const accountInfo = await connection.getAccountInfo(poolPubkey);
    if (!accountInfo) return res.status(404).json({ error: "Pool nicht gefunden" });

    // Aktiven Bin lesen
    const activeBin = accountInfo.data.readInt32LE(70);
    const minBinId = activeBin - BIN_SPREAD;
    const maxBinId = activeBin + BIN_SPREAD;

    // Pool Daten parsen
    const tokenXMint = new PublicKey(accountInfo.data.slice(72, 104));
    const tokenYMint = new PublicKey(accountInfo.data.slice(104, 136));

    return res.status(200).json({
      status: "pool_info",
      activeBin,
      range: { min: minBinId, max: maxBinId },
      tokenX: tokenXMint.toBase58(),
      tokenY: tokenYMint.toBase58(),
      pool: POOL_ADDRESS,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
