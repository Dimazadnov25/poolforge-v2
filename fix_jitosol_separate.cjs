const fs = require('fs')
const file = 'src/hooks/usePool.js'
let c = fs.readFileSync(file, 'utf8')

const oldBlock = `      // JitoSOL Balance
      const JITOSOL_MINT = 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'
      try {
        const jitoAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { mint: new PublicKey(JITOSOL_MINT) })
        const jitoAmt = jitoAccounts.value[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0
        setJitoSolBalance(jitoAmt)
        // JitoSOL Preis via Jupiter
        const jitoPrice = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=jito-staked-sol&vs_currencies=usd')
        const jitoPriceData = await jitoPrice.json()
        const jitoUsdPrice = parseFloat(jitoPriceData?.['jito-staked-sol']?.usd || 0)
        if (jitoUsdPrice > 0) setJitoSolPrice(jitoUsdPrice)
      } catch(e) { setJitoSolBalance(0) }`

const newBlock = `      // JitoSOL Balance
      const JITOSOL_MINT = 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'
      try {
        const jitoAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { mint: new PublicKey(JITOSOL_MINT) })
        const jitoAmt = jitoAccounts.value[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0
        setJitoSolBalance(jitoAmt)
      } catch(e) { setJitoSolBalance(0) }
      // JitoSOL Preis via CoinGecko
      try {
        const jitoPrice = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=jito-staked-sol&vs_currencies=usd')
        const jitoPriceData = await jitoPrice.json()
        const jitoUsdPrice = parseFloat(jitoPriceData?.['jito-staked-sol']?.usd || 0)
        if (jitoUsdPrice > 0) setJitoSolPrice(jitoUsdPrice)
      } catch(e) {}`

if (!c.includes(oldBlock)) {
  console.log('❌ nicht gefunden')
  process.exit(1)
}

c = c.replace(oldBlock, newBlock)
fs.writeFileSync(file, c)
console.log('✅ JitoSOL Balance und Preis getrennt')