import { PublicKey, TransactionInstruction } from '@solana/web3.js';

const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOC_PROGRAM = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const WHIRLPOOL_PROGRAM = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc');

export async function getATA(mint, owner) {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM.toBuffer(), mint.toBuffer()],
    ASSOC_PROGRAM
  );
  return ata;
}

export function getTickArrayAddress(whirlpool, startTick) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('tick_array'), whirlpool.toBuffer(), Buffer.from(startTick.toString())],
    WHIRLPOOL_PROGRAM
  );
  return pda;
}

export function getStartTickIndex(tick, tickSpacing) {
  const ticksInArray = tickSpacing * 88;
  return Math.floor(tick / ticksInArray) * ticksInArray;
}

export function buildIncreaseLiquidityIx(
  wallet, positionPDA, positionTokenAccount, whirlpool,
  tokenOwnerA, tokenOwnerB, vaultA, vaultB,
  tickArrayLower, tickArrayUpper, liquidityAmount, tokenMaxA, tokenMaxB
) {
  const WSOL = new PublicKey('So11111111111111111111111111111111111111112');
  const USDC = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  const MEMO = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
  const disc = Buffer.from([133, 29, 89, 223, 69, 238, 176, 10]);
  const data = Buffer.alloc(41);
  disc.copy(data, 0);
  data.writeBigUInt64LE(BigInt(liquidityAmount) & 0xFFFFFFFFFFFFFFFFn, 8);
  data.writeBigUInt64LE((BigInt(liquidityAmount) >> 64n) & 0xFFFFFFFFFFFFFFFFn, 16);
  data.writeBigUInt64LE(BigInt(Math.floor(tokenMaxA)), 24);
  data.writeBigUInt64LE(18446744073709551615n, 32);
  data.writeUInt8(0, 40);
  return new TransactionInstruction({
    programId: WHIRLPOOL_PROGRAM,
    keys: [
      { pubkey: whirlpool, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: MEMO, isSigner: false, isWritable: false },
      { pubkey: wallet, isSigner: true, isWritable: true },
      { pubkey: positionPDA, isSigner: false, isWritable: true },
      { pubkey: positionTokenAccount, isSigner: false, isWritable: false },
      { pubkey: WSOL, isSigner: false, isWritable: false },
      { pubkey: USDC, isSigner: false, isWritable: false },
      { pubkey: tokenOwnerA, isSigner: false, isWritable: true },
      { pubkey: tokenOwnerB, isSigner: false, isWritable: true },
      { pubkey: vaultA, isSigner: false, isWritable: true },
      { pubkey: vaultB, isSigner: false, isWritable: true },
      { pubkey: tickArrayLower, isSigner: false, isWritable: true },
      { pubkey: tickArrayUpper, isSigner: false, isWritable: true },
    ],
    data,
  });
}
