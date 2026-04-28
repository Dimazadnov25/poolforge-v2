import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram, VersionedTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const POOL_ADDRESS = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6";
const POSITIONS = [
  
  "MkajHWsrmJrHpgxq6z64M26GDiGKazjSmpSaJnX5S1p"
];
const OWNER = new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj");
const DLMM_PROGRAM = new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo");
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const SOL_MINT_STR = "So11111111111111111111111111111111111111112";
const USDC_MINT_STR = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const BIN_SPREAD = 4;

// removeLiquidityByRange2(lowerBinId, upperBinId, bps)
const DISC_REMOVE = Buffer.from([204, 2, 195, 145, 53, 145, 145, 205]);
const DISC_INIT_ADD = Buffer.from([109, 230, 87, 162, 44, 49, 97, 75]);

function getBinArrayPDA(poolPubkey, idx) {
  const buf = Buffer.alloc(4);
  buf.writeInt32LE(idx);
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from("bin_array"), poolPubkey.toBuffer(), buf], DLMM_PROGRAM);
  return pda;
}

function encodeBN(value, bytes=8) {
  const buf = Buffer.alloc(bytes);
  let v = BigInt(value);
  for(let i=0;i<bytes;i++) { buf[i]=Number(v&0xffn); v>>=8n; }
  return buf;
}

function encodeRemoveParams(lowerBinId, upperBinId, bps) {
  const buf = Buffer.alloc(14);
  buf.writeInt32LE(lowerBinId, 0);
  buf.writeInt32LE(upperBinId, 4);
  buf.writeUInt16LE(bps, 8);
  buf.writeUInt32LE(0, 10); // empty slices vec
  return buf;
}

async function jupiterSwap(connection, keypair, inputMint, outputMint, amount) {
  const quote = await fetch(`https://public.jupiterapi.com/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`).then(r=>r.json());
  if(quote.error) throw new Error('Jupiter: '+quote.error);
  const swapData = await fetch('https://public.jupiterapi.com/swap',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({quoteResponse:quote,userPublicKey:keypair.publicKey.toBase58(),wrapAndUnwrapSol:true})}).then(r=>r.json());
  if(!swapData.swapTransaction) throw new Error('No swap tx');
  const tx = VersionedTransaction.deserialize(Buffer.from(swapData.swapTransaction,'base64'));
  tx.sign([keypair]);
  const sig = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(sig);
  return sig;
}

async function rebalancePosition(connection, rebalanceKeypair, poolPubkey, positionPubkey, activeBin, poolInfo) {
  const positionInfo = await connection.getAccountInfo(positionPubkey);
  const lowerBinId = positionInfo.data.readInt32LE(7912);
  const upperBinId = positionInfo.data.readInt32LE(7916);
  const inRange = activeBin >= lowerBinId && activeBin <= upperBinId;
  if(inRange) return { status: "in_range", lower: lowerBinId, upper: upperBinId };

  const reserveX = new PublicKey(poolInfo.data.slice(72, 104));
  const reserveY = new PublicKey(poolInfo.data.slice(104, 136));
  const userTokenX = getAssociatedTokenAddressSync(SOL_MINT, OWNER);
  const userTokenY = getAssociatedTokenAddressSync(USDC_MINT, OWNER);
  const [eventAuthority] = PublicKey.findProgramAddressSync([Buffer.from("__event_authority")], DLMM_PROGRAM);
  const BIN_ARRAY_SIZE = 70;
  const binArrayLower = getBinArrayPDA(poolPubkey, Math.floor(lowerBinId/BIN_ARRAY_SIZE));
  const binArrayUpper = getBinArrayPDA(poolPubkey, Math.floor(upperBinId/BIN_ARRAY_SIZE));

  // Remove with lowerBinId, upperBinId, bps=10000 (100%)
  const removeData = Buffer.concat([DISC_REMOVE, encodeRemoveParams(lowerBinId, upperBinId, 10000)]);

  const removeTx = new Transaction();
  removeTx.add(new TransactionInstruction({
    programId: DLMM_PROGRAM,
    keys: [
      {pubkey:poolPubkey,isSigner:false,isWritable:true},
      {pubkey:positionPubkey,isSigner:false,isWritable:true},
      {pubkey:binArrayLower,isSigner:false,isWritable:true},
      {pubkey:binArrayUpper,isSigner:false,isWritable:true},
      {pubkey:rebalanceKeypair.publicKey,isSigner:true,isWritable:false},
      {pubkey:OWNER,isSigner:false,isWritable:false},
      {pubkey:reserveX,isSigner:false,isWritable:true},
      {pubkey:reserveY,isSigner:false,isWritable:true},
      {pubkey:userTokenX,isSigner:false,isWritable:true},
      {pubkey:userTokenY,isSigner:false,isWritable:true},
      {pubkey:SOL_MINT,isSigner:false,isWritable:false},
      {pubkey:USDC_MINT,isSigner:false,isWritable:false},
      {pubkey:TOKEN_PROGRAM_ID,isSigner:false,isWritable:false},
      {pubkey:eventAuthority,isSigner:false,isWritable:false},
      {pubkey:DLMM_PROGRAM,isSigner:false,isWritable:false},
    ],
    data: removeData,
  }));
  removeTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  removeTx.feePayer = rebalanceKeypair.publicKey;
  removeTx.sign(rebalanceKeypair);
  const removeSig = await connection.sendRawTransaction(removeTx.serialize());
  await connection.confirmTransaction(removeSig);

  // Swap to 50/50
  await new Promise(r=>setTimeout(r,2000));
  const solBalance = await connection.getBalance(OWNER);
  const usdcAccount = await connection.getTokenAccountBalance(userTokenY);
  const solLamports = solBalance - 10000000;
  const usdcMicro = parseInt(usdcAccount.value.amount);
  const BIN_STEP = 4;
  const solPrice = Math.pow(1+BIN_STEP/10000, -activeBin);
  const solValueUsdc = (solLamports/1e9)*solPrice;
  const usdcValue = usdcMicro/1e6;
  const totalValue = solValueUsdc+usdcValue;
  const targetUsdc = totalValue/2;
  let swapSig = null;
  if(usdcValue > targetUsdc*1.1) {
    swapSig = await jupiterSwap(connection, rebalanceKeypair, USDC_MINT_STR, SOL_MINT_STR, Math.floor((usdcValue-targetUsdc)*1e6));
  } else if(solValueUsdc > targetUsdc*1.1) {
    swapSig = await jupiterSwap(connection, rebalanceKeypair, SOL_MINT_STR, USDC_MINT_STR, Math.floor((solValueUsdc-targetUsdc)/solPrice*1e9));
  }

  // Neue Position
  await new Promise(r=>setTimeout(r,2000));
  const newSolBalance = await connection.getBalance(OWNER);
  const newUsdcAccount = await connection.getTokenAccountBalance(userTokenY);
  const finalSol = BigInt(newSolBalance-10000000);
  const finalUsdc = BigInt(newUsdcAccount.value.amount);
  const newLower = activeBin - BIN_SPREAD;
  const newUpper = activeBin + BIN_SPREAD;
  const newPositionKeypair = Keypair.generate();
  const newBinArrayLower = getBinArrayPDA(poolPubkey, Math.floor(newLower/BIN_ARRAY_SIZE));
  const newBinArrayUpper = getBinArrayPDA(poolPubkey, Math.floor(newUpper/BIN_ARRAY_SIZE));
  const strategyData = Buffer.alloc(13);
  strategyData.writeInt32LE(newLower,0);
  strategyData.writeInt32LE(newUpper,4);
  strategyData.writeUInt8(0,8);
  const initAddData = Buffer.concat([DISC_INIT_ADD, encodeBN(finalSol), encodeBN(finalUsdc), strategyData]);
  const openTx = new Transaction();
  openTx.add(new TransactionInstruction({
    programId: DLMM_PROGRAM,
    keys: [
      {pubkey:poolPubkey,isSigner:false,isWritable:true},
      {pubkey:newPositionKeypair.publicKey,isSigner:true,isWritable:true},
      {pubkey:newBinArrayLower,isSigner:false,isWritable:true},
      {pubkey:newBinArrayUpper,isSigner:false,isWritable:true},
      {pubkey:OWNER,isSigner:true,isWritable:true},
      {pubkey:reserveX,isSigner:false,isWritable:true},
      {pubkey:reserveY,isSigner:false,isWritable:true},
      {pubkey:userTokenX,isSigner:false,isWritable:true},
      {pubkey:userTokenY,isSigner:false,isWritable:true},
      {pubkey:SOL_MINT,isSigner:false,isWritable:false},
      {pubkey:USDC_MINT,isSigner:false,isWritable:false},
      {pubkey:TOKEN_PROGRAM_ID,isSigner:false,isWritable:false},
      {pubkey:SystemProgram.programId,isSigner:false,isWritable:false},
      {pubkey:eventAuthority,isSigner:false,isWritable:false},
      {pubkey:DLMM_PROGRAM,isSigner:false,isWritable:false},
    ],
    data: initAddData,
  }));
  openTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  openTx.feePayer = rebalanceKeypair.publicKey;
  openTx.sign(rebalanceKeypair, newPositionKeypair);
  const openSig = await connection.sendRawTransaction(openTx.serialize());
  await connection.confirmTransaction(openSig);

  return { status: "rebalanced", oldRange:{lower:lowerBinId,upper:upperBinId}, newRange:{lower:newLower,upper:newUpper}, newPosition:newPositionKeypair.publicKey.toBase58(), removeSig, swapSig, openSig };
}

export default async function handler(req, res) {
  try {
    const authHeader = req.headers['authorization'];
    if(authHeader !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({error:"Unauthorized"});
    const raw = process.env.REBALANCE_PRIVATE_KEY || '';
    const PRIVATE_KEY = JSON.parse(raw.replace(/\s/g,''));
    const rebalanceKeypair = Keypair.fromSecretKey(Uint8Array.from(PRIVATE_KEY));
    const RPC = process.env.VITE_RPC_URL;
    const connection = new Connection(RPC, "confirmed");
    const poolPubkey = new PublicKey(POOL_ADDRESS);
    const poolInfo = await connection.getAccountInfo(poolPubkey);
    const activeBin = poolInfo.data.readInt32LE(76);
    const results = [];
    for(const posAddr of POSITIONS) {
      const result = await rebalancePosition(connection, rebalanceKeypair, poolPubkey, new PublicKey(posAddr), activeBin, poolInfo);
      results.push({ position: posAddr, ...result });
    }
    return res.status(200).json({ activeBin, results });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}


