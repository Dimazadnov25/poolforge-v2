[System.IO.File]::WriteAllText("C:\Users\dzadn\poolforge-v2\fix55.cjs", @'
const fs=require('fs')
let f=fs.readFileSync('src/hooks/usePool.js','utf8')
f=f.replace(
'const posInfoU = await connection.getAccountInfo(positionPDA)\n      const tickLowerU',
'const posInfoU = await connection.getAccountInfo(positionPDA)\n      const liqCheck = posInfoU.data.readBigUInt64LE(72)\n      const tickLowerU'
)
f=f.replace(
'tx.add(new TransactionInstruction({ programId: WHIRLPOOL_PROGRAM, keys: [\n        { pubkey: SOL_USDC_WHIRLPOOL, isSigner: false, isWritable: true },\n        { pubkey: positionPDA, isSigner: false, isWritable: true },\n        { pubkey: tlU, isSigner: false, isWritable: false },\n        { pubkey: tuU, isSigner: false, isWritable: false },\n      ], data: updateDisc }))',
'if (liqCheck > 0n) tx.add(new TransactionInstruction({ programId: WHIRLPOOL_PROGRAM, keys: [\n        { pubkey: SOL_USDC_WHIRLPOOL, isSigner: false, isWritable: true },\n        { pubkey: positionPDA, isSigner: false, isWritable: true },\n        { pubkey: tlU, isSigner: false, isWritable: false },\n        { pubkey: tuU, isSigner: false, isWritable: false },\n      ], data: updateDisc }))'
)
fs.writeFileSync('src/hooks/usePool.js',f,'utf8')
console.log('done')
'@)
cd C:\Users\dzadn\poolforge-v2
node fix55.cjs
git add src/hooks/usePool.js
git commit -m "Skip updateFees if liquidity is zero"
git push