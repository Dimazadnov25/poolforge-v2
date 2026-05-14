const fs = require('fs')
const file = 'src/hooks/usePool.js'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "const jitoAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { mint: new (require('@solana/web3.js').PublicKey)(JITOSOL_MINT) })",
  "const jitoAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { mint: new PublicKey(JITOSOL_MINT) })"
)

fs.writeFileSync(file, c)
console.log('✅ require() -> PublicKey direkt')