import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const POOL_ADDRESS = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6";
const POSITION_ADDRESS = "K5K1WgzUgtsW2DS29M6pDzGTjJcUP5tWxrQYc2r2QNi";
const OWNER = new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj");
const DLMM_PROGRAM = new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo");
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const BIN_SPREAD = 4;

const DISC_REMOVE = Buffer.from([80, 85, 209, 72, 24, 206, 177, 108]);

function getBinArrayPDA(poolPubkey, binArrayIdx) {
  const idxBuffer = Buffer.alloc(4);
  idxBuffer.writeInt32LE(binArrayIdx);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("bin_array"), poolPubkey.toBuffer(), idxBuffer],
    DLMM_PROGRAM
  );
  return pda;
}

export default async function handler(req, res) {
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const raw = process.env.REBALANCE_PRIVATE_KEY || '';
    const PRIVATE_KEY = JSON.parse(raw.replace(/\s/g, ''));
    const rebalanceKeypair = Keypair.fromSecretKey(Uint8Array.from(PRIVATE_KEY));
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");

    const poolPubkey = new PublicKey(POOL_ADDRESS);
    const positionPubkey = new PublicKey(POSITION_ADDRESS);

    const poolInfo = await connection.getAccountInfo(poolPubkey);
    const positionInfo = await connection.getAccountInfo(positionPubkey);
    const activeBin = poolInfo.data.readInt32LE(76);
    const lowerBinId = positionInfo.data.readInt32LE(7912);
    const upperBinId = positionInfo.data.readInt32LE(7916);
    const inRange = activeBin >= lowerBinId && activeBin <= upperBinId;

    if (inRange) {
      return res.status(200).json({ status: "in_range", activeBin, message: "Kein Rebalance nötig" });
    }

    // Reserves
    const reserveX = new PublicKey(poolInfo.data.slice(72, 104));
    const reserveY = new PublicKey(poolInfo.data.slice(104, 136));
    const userTokenX = getAssociatedTokenAddressSync(SOL_MINT, OWNER);
    const userTokenY = getAssociatedTokenAddressSync(USDC_MINT, OWNER);

    const [eventAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("__event_authority")], DLMM_PROGRAM
    );

    const BIN_ARRAY_SIZE = 70;
    const lowerBinArrayIdx = Math.floor(lowerBinId / BIN_ARRAY_SIZE);
    const upperBinArrayIdx = Math.floor(upperBinId / BIN_ARRAY_SIZE);
    const binArrayLower = getBinArrayPDA(poolPubkey, lowerBinArrayIdx);
    const binArrayUpper = getBinArrayPDA(poolPubkey, upperBinArrayIdx);

    // Step 1: Remove Liquidity
    const removeLiqIx = new TransactionInstruction({
      programId: DLMM_PROGRAM,
      keys: [
        { pubkey: poolPubkey, isSigner: false, isWritable: true },
        { pubkey: positionPubkey, isSigner: false, isWritable: true },
        { pubkey: binArrayLower, isSigner: false, isWritable: true },
        { pubkey: binArrayUpper, isSigner: false, isWritable: true },
        { pubkey: rebalanceKeypair.publicKey, isSigner: true, isWritable: false },
        { pubkey: OWNER, isSigner: false, isWritable: false },
        { pubkey: reserveX, isSigner: false, isWritable: true },
        { pubkey: reserveY, isSigner: false, isWritable: true },
        { pubkey: userTokenX, isSigner: false, isWritable: true },
        { pubkey: userTokenY, isSigner: false, isWritable: true },
        { pubkey: SOL_MINT, isSigner: false, isWritable: false },
        { pubkey: USDC_MINT, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: eventAuthority, isSigner: false, isWritable: false },
        { pubkey: DLMM_PROGRAM, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([DISC_REMOVE, Buffer.alloc(0)]),
    });

    const tx = new Transaction();
    tx.add(removeLiqIx);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = rebalanceKeypair.publicKey;
    tx.sign(rebalanceKeypair);

    const sig = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(sig);

    const newLower = activeBin - BIN_SPREAD;
    const newUpper = activeBin + BIN_SPREAD;

    return res.status(200).json({
      status: "rebalanced",
      activeBin,
      oldRange: { lower: lowerBinId, upper: upperBinId },
      newRange: { lower: newLower, upper: newUpper },
      removeSig: sig,
      message: "Liquidität entfernt! Neue Position wird manuell geöffnet.",
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
