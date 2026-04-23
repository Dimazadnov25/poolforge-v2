import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getATA, getTickArrayAddress, getStartTickIndex, buildIncreaseLiquidityIx } from '../lib/instructions';
import { SOL_USDC_WHIRLPOOL, WHIRLPOOL_PROGRAM, priceToTick, getPositionPDA } from '../lib/pool';

const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOC_PROGRAM = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const WSOL = new PublicKey('So11111111111111111111111111111111111111112');
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const MEMO = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const VAULT_A = new PublicKey('EUuUbDcafPrmVTD5M6qoJAoyyNbihBhugADAxRMn5he9');
const VAULT_B = new PublicKey('2WLWEuKDgkDUccTpbwYp1GToYktiSB1cXvreHUwiSUVP');
const RPC = 'https://mainnet.helius-rpc.com/?api-key=e129ef66-4dde-4f0d-bc1b-e4197604806d';

export function usePool() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [poolState, setPoolState] = useState(null);
  const [solPrice, setSolPrice] = useState(null);
  const [solBalance, setSolBalance] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txStatus, setTxStatus] = useState(null);

  const refreshBalances = useCallback(async () => {
    if (!wallet?.publicKey || !connection) return;
    try {
      const sol = await connection.getBalance(wallet.publicKey);
      setSolBalance(sol / LAMPORTS_PER_SOL);
      const usdcATA = await getATA(USDC_MINT, wallet.publicKey);
      const usdcInfo = await connection.getParsedAccountInfo(usdcATA);
      const usdcAmt = usdcInfo?.value?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
      setUsdcBalance(usdcAmt);
    } catch (e) {}
  }, [wallet, connection]);

  useEffect(() => {
    const fetchPool = async () => {
      try {
        const info = await connection.getAccountInfo(SOL_USDC_WHIRLPOOL);
        if (!info) return;
        const d = info.data;
        const sqrtPriceX64 = d.readBigUInt64LE(65);
        const sqrtPrice = Number(sqrtPriceX64) / Math.pow(2, 64);
        const price = sqrtPrice * sqrtPrice * 1000;
        const currentTick = d.readInt32LE(81);
        const tickSpacing = d.readUInt16LE(41);
        const feeRate = d.readUInt16LE(39);
        setPoolState({ currentPrice: price, currentTick, tickSpacing, feeRate: feeRate / 1000000 });
      } catch (e) {}
    };
    fetchPool();
    const interval = setInterval(fetchPool, 10000);
    return () => clearInterval(interval);
  }, [connection]);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const d = await r.json();
        setSolPrice(d.solana.usd);
      } catch (e) {}
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (wallet?.publicKey) {
      refreshBalances();
      loadPositions();
    }
  }, [wallet?.publicKey]);
const loadPositions = useCallback(async () => {
    if (!wallet?.publicKey || !connection) return;
    try {
      const tokens = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_PROGRAM });
      const nfts = tokens.value.filter(a => a.account.data.parsed.info.tokenAmount.amount === '1');
      const result = [];
      for (const n of nfts) {
        const mint = new PublicKey(n.account.data.parsed.info.mint);
        const pda = getPositionPDA(mint);
        const info = await connection.getAccountInfo(pda);
        if (!info || info.owner.toBase58() !== WHIRLPOOL_PROGRAM.toBase58()) continue;
        const poolAddr = new PublicKey(info.data.slice(8, 40));
        if (poolAddr.toBase58() !== SOL_USDC_WHIRLPOOL.toBase58()) continue;
        const liq = info.data.readBigUInt64LE(72);
        if (liq === 0n) continue;
        result.push({ mint: mint.toBase58(), pda: pda.toBase58() });
      }
      setPositions(result);
    } catch (e) {}
  }, [wallet, connection]);

  const fetchPosition = useCallback(async (mintAddress) => {
    if (!connection) return null;
    try {
      const mint = new PublicKey(mintAddress);
      const pda = getPositionPDA(mint);
      const info = await connection.getAccountInfo(pda);
      if (!info) return null;
      const liq = info.data.readBigUInt64LE(72);
      const tickLower = info.data.readInt32LE(88);
      const tickUpper = info.data.readInt32LE(92);
      const feeOwedA = info.data.readBigUInt64LE(112);
      const feeOwedB = info.data.readBigUInt64LE(136);
      const priceLower = Math.pow(1.0001, tickLower) * 1000;
      const priceUpper = Math.pow(1.0001, tickUpper) * 1000;
      const curPrice = poolState?.currentPrice || 88;
      const clampedP = Math.min(Math.max(curPrice, priceLower), priceUpper);
      const decAdj = 1e-3;
      const sqrtP = Math.sqrt(clampedP * decAdj);
      const sqrtPl = Math.sqrt(priceLower * decAdj);
      const sqrtPu = Math.sqrt(priceUpper * decAdj);
      const liqNum = Number(liq);
      const solAmount = liqNum * (1 / sqrtP - 1 / sqrtPu) / 1e9;
      const usdcAmount = liqNum * (sqrtP - sqrtPl) / 1e6;
      return {
        liquidity: liq.toString(),
        tickLower, tickUpper, priceLower, priceUpper,
        feeOwedA: feeOwedA.toString(),
        feeOwedB: feeOwedB.toString(),
        solAmount, usdcAmount
      };
    } catch (e) { return null; }
  }, [connection, poolState]);
const openPosition = useCallback(async ({ priceLower, priceUpper, solAmount }) => {
    if (!wallet?.publicKey || !connection) return;
    try {
      setLoading(true);
      setError(null);
      const { Keypair } = await import('@solana/web3.js');
      const tickLower = priceToTick(priceLower, poolState.tickSpacing);
      const tickUpper = priceToTick(priceUpper, poolState.tickSpacing);
      const positionMintKeypair = Keypair.generate();
      const positionMint = positionMintKeypair.publicKey;
      const positionPDA = getPositionPDA(positionMint);
      const positionTokenAccount = await getATA(positionMint, wallet.publicKey);
      const tokenOwnerA = await getATA(WSOL, wallet.publicKey);
      const tokenOwnerB = await getATA(USDC_MINT, wallet.publicKey);
      const tickArrayLower = getTickArrayAddress(SOL_USDC_WHIRLPOOL, getStartTickIndex(tickLower, poolState.tickSpacing));
      const tickArrayUpper = getTickArrayAddress(SOL_USDC_WHIRLPOOL, getStartTickIndex(tickUpper, poolState.tickSpacing));
      const lamports = Math.floor(solAmount * 1e9);
      const decAdj = 1e-3;
      const sqrtP = Math.sqrt(poolState.currentPrice * decAdj);
      const sqrtPl = Math.sqrt(Math.pow(1.0001, tickLower) * 1000 * decAdj);
      const sqrtPu = Math.sqrt(Math.pow(1.0001, tickUpper) * 1000 * decAdj);
      const liquidityAmount = Math.floor(lamports * sqrtP * sqrtPu / (sqrtPu - sqrtP));
      const usdcRaw = Math.floor(liquidityAmount * (sqrtP - sqrtPl) * 1e6);
      // TX1: Open position NFT
      const openDisc = Buffer.from([135, 128, 47, 77, 15, 152, 240, 49]);
      const openData = Buffer.alloc(17);
      openDisc.copy(openData, 0);
      openData.writeUInt8(255, 8);
      openData.writeInt32LE(tickLower, 9);
      openData.writeInt32LE(tickUpper, 13);
      const { blockhash: bh1, lastValidBlockHeight: lv1 } = await connection.getLatestBlockhash();
      const tx1 = new Transaction({ recentBlockhash: bh1, feePayer: wallet.publicKey });
      tx1.add(new TransactionInstruction({ programId: WHIRLPOOL_PROGRAM, keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: positionPDA, isSigner: false, isWritable: true },
        { pubkey: positionMint, isSigner: true, isWritable: true },
        { pubkey: positionTokenAccount, isSigner: false, isWritable: true },
        { pubkey: SOL_USDC_WHIRLPOOL, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
        { pubkey: ASSOC_PROGRAM, isSigner: false, isWritable: false },
      ], data: openData }));
      tx1.partialSign(positionMintKeypair);
      setTxStatus('signing');
      const signed1 = await wallet.signTransaction(tx1);
      setTxStatus('sending');
      const sig1 = await connection.sendRawTransaction(signed1.serialize(), { skipPreflight: true });
      await connection.confirmTransaction({ signature: sig1, blockhash: bh1, lastValidBlockHeight: lv1 }, 'confirmed');
      // TX2: Add liquidity with wSOL wrap
      const { blockhash: bh2, lastValidBlockHeight: lv2 } = await connection.getLatestBlockhash();
      const tx2 = new Transaction({ recentBlockhash: bh2, feePayer: wallet.publicKey });
      const wsolInfo = await connection.getAccountInfo(tokenOwnerA);
      if (!wsolInfo) {
        tx2.add({ programId: ASSOC_PROGRAM, keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
          { pubkey: WSOL, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        ], data: Buffer.from([]) });
      }
      tx2.add(SystemProgram.transfer({ fromPubkey: wallet.publicKey, toPubkey: tokenOwnerA, lamports: Math.floor(lamports * 1.1) }));
      tx2.add(new TransactionInstruction({ programId: TOKEN_PROGRAM, keys: [{ pubkey: tokenOwnerA, isSigner: false, isWritable: true }], data: Buffer.from([17]) }));
      tx2.add(buildIncreaseLiquidityIx(wallet.publicKey, positionPDA, positionTokenAccount, SOL_USDC_WHIRLPOOL, tokenOwnerA, tokenOwnerB, VAULT_A, VAULT_B, tickArrayLower, tickArrayUpper, liquidityAmount, Math.floor(lamports * 1.1), Math.floor(usdcRaw * 1.1)));
      tx2.add(new TransactionInstruction({ programId: TOKEN_PROGRAM, keys: [
        { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      ], data: Buffer.from([9]) }));
      setTxStatus('signing');
      const signed2 = await wallet.signTransaction(tx2);
      setTxStatus('sending');
      const sig2 = await connection.sendRawTransaction(signed2.serialize(), { skipPreflight: true });
      await connection.confirmTransaction({ signature: sig2, blockhash: bh2, lastValidBlockHeight: lv2 }, 'confirmed');
      setTxStatus('confirmed');
      await refreshBalances();
      await loadPositions();
    } catch (e) {
      setError(e.message);
      setTxStatus(null);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, poolState, refreshBalances]);

  const addLiquidity = useCallback(async (mintAddress, solAmount) => {
    if (!wallet?.publicKey || !connection) return;
    try {
      setLoading(true);
      const mint = new PublicKey(mintAddress);
      const positionPDA = getPositionPDA(mint);
      const positionTokenAccount = await getATA(mint, wallet.publicKey);
      const tokenOwnerA = await getATA(WSOL, wallet.publicKey);
      const tokenOwnerB = await getATA(USDC_MINT, wallet.publicKey);
      const posInfo = await connection.getAccountInfo(positionPDA);
      const tickLower = posInfo.data.readInt32LE(88);
      const tickUpper = posInfo.data.readInt32LE(92);
      const tickArrayLower = getTickArrayAddress(SOL_USDC_WHIRLPOOL, getStartTickIndex(tickLower, poolState.tickSpacing));
      const tickArrayUpper = getTickArrayAddress(SOL_USDC_WHIRLPOOL, getStartTickIndex(tickUpper, poolState.tickSpacing));
      const lamports = Math.floor(solAmount * 1e9);
      const decAdj = 1e-3;
      const sqrtP = Math.sqrt(poolState.currentPrice * decAdj);
      const sqrtPl = Math.sqrt(Math.pow(1.0001, tickLower) * 1000 * decAdj);
      const sqrtPu = Math.sqrt(Math.pow(1.0001, tickUpper) * 1000 * decAdj);
      const liquidityAmount = Math.floor(lamports * sqrtP * sqrtPu / (sqrtPu - sqrtP));
      const usdcRaw = Math.floor(liquidityAmount * (sqrtP - sqrtPl) * 1e6);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction({ recentBlockhash: blockhash, feePayer: wallet.publicKey });
      const wsolInfo = await connection.getAccountInfo(tokenOwnerA);
      if (!wsolInfo) {
        tx.add({ programId: ASSOC_PROGRAM, keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
          { pubkey: WSOL, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        ], data: Buffer.from([]) });
      }
      tx.add(SystemProgram.transfer({ fromPubkey: wallet.publicKey, toPubkey: tokenOwnerA, lamports: Math.floor(lamports * 1.1) }));
      tx.add(new TransactionInstruction({ programId: TOKEN_PROGRAM, keys: [{ pubkey: tokenOwnerA, isSigner: false, isWritable: true }], data: Buffer.from([17]) }));
      tx.add(buildIncreaseLiquidityIx(wallet.publicKey, positionPDA, positionTokenAccount, SOL_USDC_WHIRLPOOL, tokenOwnerA, tokenOwnerB, VAULT_A, VAULT_B, tickArrayLower, tickArrayUpper, liquidityAmount, Math.floor(lamports * 1.1), Math.floor(usdcRaw * 1.1)));
      tx.add(new TransactionInstruction({ programId: TOKEN_PROGRAM, keys: [
        { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      ], data: Buffer.from([9]) }));
      setTxStatus('signing');
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: true });
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
      setTxStatus('confirmed');
      await refreshBalances();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, poolState, refreshBalances]);

  const collectFees = useCallback(async (mintAddress) => {
    if (!wallet?.publicKey || !connection) return;
    try {
      setLoading(true);
      const mint = new PublicKey(mintAddress);
      const positionPDA = getPositionPDA(mint);
      const positionTokenAccount = await getATA(mint, wallet.publicKey);
      const tokenOwnerA = await getATA(WSOL, wallet.publicKey);
      const tokenOwnerB = await getATA(USDC_MINT, wallet.publicKey);
      const disc = Buffer.from([207, 117, 95, 191, 229, 180, 226, 15]);
      const data = Buffer.alloc(17);
      disc.copy(data, 0);
      data.writeUInt8(0, 16);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction({ recentBlockhash: blockhash, feePayer: wallet.publicKey });
      tx.add(new TransactionInstruction({ programId: WHIRLPOOL_PROGRAM, keys: [
        { pubkey: SOL_USDC_WHIRLPOOL, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: positionPDA, isSigner: false, isWritable: true },
        { pubkey: positionTokenAccount, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        { pubkey: MEMO, isSigner: false, isWritable: false },
        { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
        { pubkey: tokenOwnerB, isSigner: false, isWritable: true },
        { pubkey: WSOL, isSigner: false, isWritable: false },
        { pubkey: USDC_MINT, isSigner: false, isWritable: false },
        { pubkey: VAULT_A, isSigner: false, isWritable: true },
        { pubkey: VAULT_B, isSigner: false, isWritable: true },
      ], data }));
      tx.add(new TransactionInstruction({ programId: TOKEN_PROGRAM, keys: [
        { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      ], data: Buffer.from([9]) }));
      setTxStatus('signing');
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: true });
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
      setTxStatus('confirmed');
      await refreshBalances();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, refreshBalances]);

  const closePosition = useCallback(async (mintAddress) => {
    if (!wallet?.publicKey || !connection) return;
    try {
      setLoading(true);
      const mint = new PublicKey(mintAddress);
      const positionPDA = getPositionPDA(mint);
      const positionTokenAccount = await getATA(mint, wallet.publicKey);
      const tokenOwnerA = await getATA(WSOL, wallet.publicKey);
      const tokenOwnerB = await getATA(USDC_MINT, wallet.publicKey);
      const posInfo = await connection.getAccountInfo(positionPDA);
      const liquidity = posInfo.data.readBigUInt64LE(72);
      const tickLower = posInfo.data.readInt32LE(88);
      const tickUpper = posInfo.data.readInt32LE(92);
      const tickArrayLower = getTickArrayAddress(SOL_USDC_WHIRLPOOL, getStartTickIndex(tickLower, poolState.tickSpacing));
      const tickArrayUpper = getTickArrayAddress(SOL_USDC_WHIRLPOOL, getStartTickIndex(tickUpper, poolState.tickSpacing));
      if (liquidity > 0n) {
        const decDisc = Buffer.from([58, 127, 188, 62, 79, 82, 196, 96]);
        const decData = Buffer.alloc(41);
        decDisc.copy(decData, 0);
        decData.writeBigUInt64LE(liquidity & 0xFFFFFFFFFFFFFFFFn, 8);
        decData.writeBigUInt64LE(0n, 16);
        decData.writeBigUInt64LE(0n, 24);
        decData.writeBigUInt64LE(0n, 32);
        decData.writeUInt8(0, 40);
        const { blockhash: bh1, lastValidBlockHeight: lv1 } = await connection.getLatestBlockhash();
        const tx1 = new Transaction({ recentBlockhash: bh1, feePayer: wallet.publicKey });
        const wsolInfo = await connection.getAccountInfo(tokenOwnerA);
        if (!wsolInfo) {
          tx1.add({ programId: ASSOC_PROGRAM, keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
            { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
            { pubkey: WSOL, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
          ], data: Buffer.from([]) });
        }
        tx1.add(new TransactionInstruction({ programId: WHIRLPOOL_PROGRAM, keys: [
          { pubkey: SOL_USDC_WHIRLPOOL, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
          { pubkey: MEMO, isSigner: false, isWritable: false },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: positionPDA, isSigner: false, isWritable: true },
          { pubkey: positionTokenAccount, isSigner: false, isWritable: false },
          { pubkey: WSOL, isSigner: false, isWritable: false },
          { pubkey: USDC_MINT, isSigner: false, isWritable: false },
          { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
          { pubkey: tokenOwnerB, isSigner: false, isWritable: true },
          { pubkey: VAULT_A, isSigner: false, isWritable: true },
          { pubkey: VAULT_B, isSigner: false, isWritable: true },
          { pubkey: tickArrayLower, isSigner: false, isWritable: true },
          { pubkey: tickArrayUpper, isSigner: false, isWritable: true },
        ], data: decData }));
        tx1.add(new TransactionInstruction({ programId: TOKEN_PROGRAM, keys: [
          { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        ], data: Buffer.from([9]) }));
        setTxStatus('signing');
        const signed1 = await wallet.signTransaction(tx1);
        const sig1 = await connection.sendRawTransaction(signed1.serialize(), { skipPreflight: true });
        await connection.confirmTransaction({ signature: sig1, blockhash: bh1, lastValidBlockHeight: lv1 }, 'confirmed');
      }
      const closeDisc = Buffer.from([123, 134, 81, 0, 49, 68, 98, 98]);
      const { blockhash: bh2, lastValidBlockHeight: lv2 } = await connection.getLatestBlockhash();
      const tx2 = new Transaction({ recentBlockhash: bh2, feePayer: wallet.publicKey });
      tx2.add(new TransactionInstruction({ programId: WHIRLPOOL_PROGRAM, keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: positionPDA, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: true },
        { pubkey: positionTokenAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
      ], data: closeDisc }));
      setTxStatus('signing');
      const signed2 = await wallet.signTransaction(tx2);
      const sig2 = await connection.sendRawTransaction(signed2.serialize(), { skipPreflight: true });
      await connection.confirmTransaction({ signature: sig2, blockhash: bh2, lastValidBlockHeight: lv2 }, 'confirmed');
      setTxStatus('confirmed');
      setPositions(prev => prev.filter(p => p.mint !== mintAddress));
      await refreshBalances();
    } catch (e) {
      setError(e.message);
      setTxStatus(null);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, poolState, refreshBalances]);

  const rebalancePosition = useCallback(async (mintAddress) => {
    if (!wallet?.publicKey || !connection) return;
    try {
      setLoading(true);
      await closePosition(mintAddress);
      const currentPrice = poolState.currentPrice;
      const newPriceLower = parseFloat((currentPrice * 0.97).toFixed(2));
      const newPriceUpper = parseFloat((currentPrice * 1.03).toFixed(2));
      const solBal = await connection.getBalance(wallet.publicKey);
      const solAmount = Math.max(0.001, (solBal - 0.05e9) / 1e9);
      await openPosition({ priceLower: newPriceLower, priceUpper: newPriceUpper, solAmount });
      setTxStatus('confirmed');
    } catch (e) {
      setError(e.message);
      setTxStatus(null);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, poolState, closePosition, openPosition]);

  return {
    poolState, solPrice, solBalance, usdcBalance,
    positions, loading, error, txStatus,
    openPosition, addLiquidity, collectFees, closePosition,
    rebalancePosition, fetchPosition, refreshBalances, loadPositions
  };
}
const openPosition = useCallback(async ({ priceLower, priceUpper, solAmount }) => {
    if (!wallet?.publicKey || !connection) return;
    try {
      setLoading(true);
      setError(null);
      const { Keypair } = await import('@solana/web3.js');
      const tickLower = priceToTick(priceLower, poolState.tickSpacing);
      const tickUpper = priceToTick(priceUpper, poolState.tickSpacing);
      const positionMintKeypair = Keypair.generate();
      const positionMint = positionMintKeypair.publicKey;
      const positionPDA = getPositionPDA(positionMint);
      const positionTokenAccount = await getATA(positionMint, wallet.publicKey);
      const tokenOwnerA = await getATA(WSOL, wallet.publicKey);
      const tokenOwnerB = await getATA(USDC_MINT, wallet.publicKey);
      const tickArrayLower = getTickArrayAddress(SOL_USDC_WHIRLPOOL, getStartTickIndex(tickLower, poolState.tickSpacing));
      const tickArrayUpper = getTickArrayAddress(SOL_USDC_WHIRLPOOL, getStartTickIndex(tickUpper, poolState.tickSpacing));
      const lamports = Math.floor(solAmount * 1e9);
      const decAdj = 1e-3;
      const sqrtP = Math.sqrt(poolState.currentPrice * decAdj);
      const sqrtPl = Math.sqrt(priceLower * decAdj);
      const sqrtPu = Math.sqrt(priceUpper * decAdj);
      const liquidityAmount = Math.floor(lamports * sqrtP * sqrtPu / (sqrtPu - sqrtP));
      const usdcRaw = Math.floor(liquidityAmount * (sqrtP - sqrtPl) * 1e6);
      // TX1: Open position
      const openDisc = Buffer.from([135, 128, 47, 77, 15, 152, 240, 49]);
      const openData = Buffer.alloc(17);
      openDisc.copy(openData, 0);
      openData.writeUInt8(255, 8);
      openData.writeInt32LE(tickLower, 9);
      openData.writeInt32LE(tickUpper, 13);
      const { blockhash: bh1, lastValidBlockHeight: lv1 } = await connection.getLatestBlockhash();
      const tx1 = new Transaction({ recentBlockhash: bh1, feePayer: wallet.publicKey });
      tx1.add(new TransactionInstruction({ programId: WHIRLPOOL_PROGRAM, keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: positionPDA, isSigner: false, isWritable: true },
        { pubkey: positionMint, isSigner: true, isWritable: true },
        { pubkey: positionTokenAccount, isSigner: false, isWritable: true },
        { pubkey: SOL_USDC_WHIRLPOOL, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
        { pubkey: ASSOC_PROGRAM, isSigner: false, isWritable: false },
      ], data: openData }));
      tx1.partialSign(positionMintKeypair);
      setTxStatus('signing');
      const signed1 = await wallet.signTransaction(tx1);
      setTxStatus('sending');
      const sig1 = await connection.sendRawTransaction(signed1.serialize(), { skipPreflight: true });
      await connection.confirmTransaction({ signature: sig1, blockhash: bh1, lastValidBlockHeight: lv1 }, 'confirmed');
      // TX2: Add liquidity
      const { blockhash: bh2, lastValidBlockHeight: lv2 } = await connection.getLatestBlockhash();
      const tx2 = new Transaction({ recentBlockhash: bh2, feePayer: wallet.publicKey });
      const wsolInfo = await connection.getAccountInfo(tokenOwnerA);
      if (!wsolInfo) {
        tx2.add({ programId: ASSOC_PROGRAM, keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
          { pubkey: WSOL, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        ], data: Buffer.from([]) });
      }
      tx2.add(SystemProgram.transfer({ fromPubkey: wallet.publicKey, toPubkey: tokenOwnerA, lamports: Math.floor(lamports * 1.1) }));
      tx2.add(new TransactionInstruction({ programId: TOKEN_PROGRAM, keys: [{ pubkey: tokenOwnerA, isSigner: false, isWritable: true }], data: Buffer.from([17]) }));
      tx2.add(buildIncreaseLiquidityIx(wallet.publicKey, positionPDA, positionTokenAccount, SOL_USDC_WHIRLPOOL, tokenOwnerA, tokenOwnerB, VAULT_A, VAULT_B, tickArrayLower, tickArrayUpper, liquidityAmount, Math.floor(lamports * 1.1), Math.floor(usdcRaw * 1.1)));
      tx2.add(new TransactionInstruction({ programId: TOKEN_PROGRAM, keys: [
        { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      ], data: Buffer.from([9]) }));
      setTxStatus('signing');
      const signed2 = await wallet.signTransaction(tx2);
      setTxStatus('sending');
      const sig2 = await connection.sendRawTransaction(signed2.serialize(), { skipPreflight: true });
      await connection.confirmTransaction({ signature: sig2, blockhash: bh2, lastValidBlockHeight: lv2 }, 'confirmed');
      setTxStatus('confirmed');
      await refreshBalances();
      await loadPositions();
    } catch (e) {
      setError(e.message);
      setTxStatus(null);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, poolState, refreshBalances]);

  const addLiquidity = useCallback(async (mintAddress, solAmount) => {
    if (!wallet?.publicKey || !connection) return;
    try {
      setLoading(true);
      const mint = new PublicKey(mintAddress);
      const positionPDA = getPositionPDA(mint);
      const positionTokenAccount = await getATA(mint, wallet.publicKey);
      const tokenOwnerA = await getATA(WSOL, wallet.publicKey);
      const tokenOwnerB = await getATA(USDC_MINT, wallet.publicKey);
      const posInfo = await connection.getAccountInfo(positionPDA);
      const tickLower = posInfo.data.readInt32LE(88);
      const tickUpper = posInfo.data.readInt32LE(92);
      const tickArrayLower = getTickArrayAddress(SOL_USDC_WHIRLPOOL, getStartTickIndex(tickLower, poolState.tickSpacing));
      const tickArrayUpper = getTickArrayAddress(SOL_USDC_WHIRLPOOL, getStartTickIndex(tickUpper, poolState.tickSpacing));
      const lamports = Math.floor(solAmount * 1e9);
      const decAdj = 1e-3;
      const sqrtP = Math.sqrt(poolState.currentPrice * decAdj);
      const sqrtPl = Math.sqrt(Math.pow(1.0001, tickLower) * 1000 * decAdj);
      const sqrtPu = Math.sqrt(Math.pow(1.0001, tickUpper) * 1000 * decAdj);
      const liquidityAmount = Math.floor(lamports * sqrtP * sqrtPu / (sqrtPu - sqrtP));
      const usdcRaw = Math.floor(liquidityAmount * (sqrtP - sqrtPl) * 1e6);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction({ recentBlockhash: blockhash, feePayer: wallet.publicKey });
      const wsolInfo = await connection.getAccountInfo(tokenOwnerA);
      if (!wsolInfo) {
        tx.add({ programId: ASSOC_PROGRAM, keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
          { pubkey: WSOL, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        ], data: Buffer.from([]) });
      }
      tx.add(SystemProgram.transfer({ fromPubkey: wallet.publicKey, toPubkey: tokenOwnerA, lamports: Math.floor(lamports * 1.1) }));
      tx.add(new TransactionInstruction({ programId: TOKEN_PROGRAM, keys: [{ pubkey: tokenOwnerA, isSigner: false, isWritable: true }], data: Buffer.from([17]) }));
      tx.add(buildIncreaseLiquidityIx(wallet.publicKey, positionPDA, positionTokenAccount, SOL_USDC_WHIRLPOOL, tokenOwnerA, tokenOwnerB, VAULT_A, VAULT_B, tickArrayLower, tickArrayUpper, liquidityAmount, Math.floor(lamports * 1.1), Math.floor(usdcRaw * 1.1)));
      tx.add(new TransactionInstruction({ programId: TOKEN_PROGRAM, keys: [
        { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      ], data: Buffer.from([9]) }));
      setTxStatus('signing');
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: true });
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
      setTxStatus('confirmed');
      await refreshBalances();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, poolState, refreshBalances]);

  const collectFees = useCallback(async (mintAddress) => {
    if (!wallet?.publicKey || !connection) return;
    try {
      setLoading(true);
      const mint = new PublicKey(mintAddress);
      const positionPDA = getPositionPDA(mint);
      const positionTokenAccount = await getATA(mint, wallet.publicKey);
      const tokenOwnerA = await getATA(WSOL, wallet.publicKey);
      const tokenOwnerB = await getATA(USDC_MINT, wallet.publicKey);
      const disc = Buffer.from([207, 117, 95, 191, 229, 180, 226, 15]);
      const data = Buffer.alloc(9);
      disc.copy(data, 0);
      data.writeUInt8(0, 8);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction({ recentBlockhash: blockhash, feePayer: wallet.publicKey });
      tx.add(new TransactionInstruction({ programId: WHIRLPOOL_PROGRAM, keys: [
        { pubkey: SOL_USDC_WHIRLPOOL, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        { pubkey: MEMO, isSigner: false, isWritable: false },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: positionPDA, isSigner: false, isWritable: true },
        { pubkey: positionTokenAccount, isSigner: false, isWritable: false },
        { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
        { pubkey: tokenOwnerB, isSigner: false, isWritable: true },
        { pubkey: VAULT_A, isSigner: false, isWritable: true },
        { pubkey: VAULT_B, isSigner: false, isWritable: true },
        { pubkey: WSOL, isSigner: false, isWritable: false },
        { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      ], data }));
      tx.add(new TransactionInstruction({ programId: TOKEN_PROGRAM, keys: [
        { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      ], data: Buffer.from([9]) }));
      setTxStatus('signing');
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
      setTxStatus('confirmed');
      await refreshBalances();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, refreshBalances]);

  const decreaseLiquidity = useCallback(async (mintAddress, liquidityAmount) => {
    if (!wallet?.publicKey || !connection) return;
    try {
      setLoading(true);
      const mint = new PublicKey(mintAddress);
      const positionPDA = getPositionPDA(mint);
      const positionTokenAccount = await getATA(mint, wallet.publicKey);
      const tokenOwnerA = await getATA(WSOL, wallet.publicKey);
      const tokenOwnerB = await getATA(USDC_MINT, wallet.publicKey);
      const posInfo = await connection.getAccountInfo(positionPDA);
      const tickLower = posInfo.data.readInt32LE(88);
      const tickUpper = posInfo.data.readInt32LE(92);
      const tickArrayLower = getTickArrayAddress(SOL_USDC_WHIRLPOOL, getStartTickIndex(tickLower, poolState.tickSpacing));
      const tickArrayUpper = getTickArrayAddress(SOL_USDC_WHIRLPOOL, getStartTickIndex(tickUpper, poolState.tickSpacing));
      const disc = Buffer.from([58, 127, 188, 62, 79, 82, 196, 96]);
      const data = Buffer.alloc(41);
      disc.copy(data, 0);
      data.writeBigUInt64LE(BigInt(liquidityAmount) & 0xFFFFFFFFFFFFFFFFn, 8);
      data.writeBigUInt64LE(0n, 16);
      data.writeBigUInt64LE(0n, 24);
      data.writeBigUInt64LE(0n, 32);
      data.writeUInt8(0, 40);
      const wsolInfo = await connection.getAccountInfo(tokenOwnerA);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction({ recentBlockhash: blockhash, feePayer: wallet.publicKey });
      if (!wsolInfo) {
        tx.add({ programId: ASSOC_PROGRAM, keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
          { pubkey: WSOL, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        ], data: Buffer.from([]) });
      }
      tx.add(new TransactionInstruction({ programId: WHIRLPOOL_PROGRAM, keys: [
        { pubkey: SOL_USDC_WHIRLPOOL, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
        { pubkey: MEMO, isSigner: false, isWritable: false },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: positionPDA, isSigner: false, isWritable: true },
        { pubkey: positionTokenAccount, isSigner: false, isWritable: false },
        { pubkey: WSOL, isSigner: false, isWritable: false },
        { pubkey: USDC_MINT, isSigner: false, isWritable: false },
        { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
        { pubkey: tokenOwnerB, isSigner: false, isWritable: true },
        { pubkey: VAULT_A, isSigner: false, isWritable: true },
        { pubkey: VAULT_B, isSigner: false, isWritable: true },
        { pubkey: tickArrayLower, isSigner: false, isWritable: true },
        { pubkey: tickArrayUpper, isSigner: false, isWritable: true },
      ], data }));
      tx.add(new TransactionInstruction({ programId: TOKEN_PROGRAM, keys: [
        { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      ], data: Buffer.from([9]) }));
      setTxStatus('signing');
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
      setTxStatus('confirmed');
      await refreshBalances();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, poolState, refreshBalances]);

  const closePosition = useCallback(async (mintAddress) => {
    if (!wallet?.publicKey || !connection) return;
    try {
      setLoading(true);
      const mint = new PublicKey(mintAddress);
      const positionPDA = getPositionPDA(mint);
      const positionTokenAccount = await getATA(mint, wallet.publicKey);
      const posInfo = await connection.getAccountInfo(positionPDA);
      const liq = posInfo.data.readBigUInt64LE(72);
      if (liq > 0n) await decreaseLiquidity(mintAddress, liq.toString());
      const disc = Buffer.from([123, 134, 81, 0, 49, 68, 98, 98]);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction({ recentBlockhash: blockhash, feePayer: wallet.publicKey });
      tx.add(new TransactionInstruction({ programId: WHIRLPOOL_PROGRAM, keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: positionPDA, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: true },
        { pubkey: positionTokenAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
      ], data: disc }));
      setTxStatus('signing');
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
      setTxStatus('confirmed');
      setPositions(prev => prev.filter(p => p.mint !== mintAddress));
      await refreshBalances();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, decreaseLiquidity, refreshBalances]);

  const rebalancePosition = useCallback(async (mintAddress) => {
    if (!wallet?.publicKey || !connection) return;
    try {
      setLoading(true);
      setTxStatus('rebalancing');
      await closePosition(mintAddress);
      const currentPrice = poolState.currentPrice;
      const newPriceLower = parseFloat((currentPrice * 0.97).toFixed(2));
      const newPriceUpper = parseFloat((currentPrice * 1.03).toFixed(2));
      const solBal = await connection.getBalance(wallet.publicKey);
      const solAmount = Math.max(0.001, (solBal - 0.05e9) / 1e9);
      await openPosition({ priceLower: newPriceLower, priceUpper: newPriceUpper, solAmount });
      setTxStatus('confirmed');
      await refreshBalances();
    } catch (e) {
      setError(e.message);
      setTxStatus(null);
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, poolState, closePosition, refreshBalances]);

  return {
    poolState, solPrice, solBalance, usdcBalance,
    positions, loading, error, txStatus,
    openPosition, addLiquidity, collectFees,
    decreaseLiquidity, closePosition, rebalancePosition,
    fetchPosition, loadPositions, refreshBalances,
  };
}
