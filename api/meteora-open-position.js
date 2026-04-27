export default async function handler(req, res) {
  try {
    const { default: DLMM } = await import("@meteora-ag/dlmm");
    const { Connection, PublicKey, Keypair } = await import("@solana/web3.js");
    const { default: BN } = await import("bn.js");

    const POOL_ADDRESS = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6";
    const BIN_SPREAD = 10;
    const SOL_AMOUNT = 0.05 * 1e9;

    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");
    const userPubkey = new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj");
    const poolPubkey = new PublicKey(POOL_ADDRESS);

    const dlmmPool = await DLMM.create(connection, poolPubkey);
    const activeBin = await dlmmPool.getActiveBin();
    const minBinId = activeBin.binId - BIN_SPREAD;
    const maxBinId = activeBin.binId + BIN_SPREAD;

    const positionKeypair = Keypair.generate();
    const totalXAmount = new BN(SOL_AMOUNT);
    const totalYAmount = new BN(0);

    const createPositionTx = await dlmmPool.initializePositionAndAddLiquidityByStrategy({
      positionPubKey: positionKeypair.publicKey,
      user: userPubkey,
      totalXAmount,
      totalYAmount,
      strategy: { maxBinId, minBinId, strategyType: 0 },
    });

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
