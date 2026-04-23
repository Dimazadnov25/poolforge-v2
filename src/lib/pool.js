import { PublicKey } from '@solana/web3.js';

export const SOL_USDC_WHIRLPOOL = new PublicKey('Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE');
export const WHIRLPOOL_PROGRAM = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc');

export function priceToTick(price, tickSpacing = 4) {
  const tick = Math.log(price / 1000) / Math.log(1.0001);
  return Math.round(tick / tickSpacing) * tickSpacing;
}

export function getPositionPDA(mint) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('position'), mint.toBuffer()],
    WHIRLPOOL_PROGRAM
  );
  return pda;
}
