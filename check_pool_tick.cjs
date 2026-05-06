const { Connection, PublicKey } = require('@solana/web3.js')
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2')

async function check() {
  // Position neu lesen
  const posPda = new PublicKey('CpvrEPdWMYKKbskEoVuN3wjHnFvZjRaV3wcTpnMFNN8i')
  const posInfo = await conn.getAccountInfo(posPda)
  const pd = posInfo.data
  const tickLower = pd.readInt32LE(73)
  const tickUpper = pd.readInt32LE(77)
  console.log('tickLower:', tickLower, 'tickUpper:', tickUpper)

  // Pool aus TX bekannt
  const poolPk = new PublicKey('9GTj99g9tbz9U6UYDsX6YeRTgUnkYG6GTnHv3qLa5aXq')
  const poolInfo = await conn.getAccountInfo(poolPk)
  console.log('Pool owner:', poolInfo.owner.toBase58())
  console.log('Pool size:', poolInfo.data.length)
  
  const d = poolInfo.data
  console.log('\nSuche currentTick zwischen', tickLower, 'und', tickUpper, ':')
  for (let i = 0; i < d.length - 3; i++) {
    const v = d.readInt32LE(i)
    if (v >= tickLower && v <= tickUpper) {
      console.log(`  offset ${i}: ${v}`)
    }
  }
}
check().catch(console.error)