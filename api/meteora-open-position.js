import DLMM from "@meteora-ag/dlmm";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import BN from "bn.js";

const POOL_ADDRESS = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6";
const BIN_SPREAD = 10;
const SOL_AMOUNT = 0.05 * 1e9; // 0.05 SOL in lamports

export default async function handler(req, res) {
  try {
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");

    const userPubkey = new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj");
    const poolPubkey = new PublicKey(POOL_ADDRESS);

    // Pool laden
    const dlmmPool = await DLMM.create(connection, poolPubkey);

    // Aktiven Bin holen
    const activeBin = await dlmmPool.getActiveBin();
    const minBinId = activeBin.binId - BIN_SPREAD;
    const maxBinId = activeBin.binId + BIN_SPREAD;

    // Neues Position Keypair
    const positionKeypair = Keypair.generate();

    // SOL Menge
    const totalXAmount = new BN(SOL_AMOUNT);
    const totalYAmount = new BN(0);

    // Transaktion bauen
    const createPositionTx = await dlmmPool.initializePositionAndAddLiquidityByStrategy({
      positionPubKey: positionKeypair.publicKey,
      user: userPubkey,
      totalXAmount,
      totalYAmount,
      strategy: {
        maxBinId,
        minBinId,
        strategyType: 0, // Spot
      },
    });

    // Transaktion serialisieren für Phantom
    createPositionTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    createPositionTx.feePayer = userPubkey;
    createPositionTx.partialSign(positionKeypair);

    const serialized = createPositionTx.serialize({ requireAllSignatures: false });
    const base64 = Buffer.from(serialized).toString("base64");

    return res.status(200).json({
      transaction: base64,
      positionPubKey: positionKeypair.publicKey.toBase58(),
      activeBin: activeBin.binId,
      range: { min: minBinId, max: maxBinId },
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
