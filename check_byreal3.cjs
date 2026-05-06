const { Connection, PublicKey } = require('@solana/web3.js')
const RPC = 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const conn = new Connection(RPC)

async function check() {
  // Account [1] aus der TX - wahrscheinlich Position Account
  const accounts = [
    'HyE8MxZTzWE8JYJZaYWTkt7tiUDbNVKA5AyfX1S55hJv',
    '5m4WjSw5eofqwG4mYXEvfRJBzQX5R3LoL11fXXvPJLTS',
    '9GTj99g9tbz9U6UYDsX6YeRTgUnkYG6GTnHv3qLa5aXq',
    'FNcYxSWLUYjdXZS7Ktcna3kd4MCfPHaNBmjwTW9fWYSM',
    '7HZNXH6ZDxGhvPSgcvsiHvMBCyb8dvf9ZL4gwRkjRmbh',
  ]

  for (const addr of accounts) {
    const info = await conn.getAccountInfo(new PublicKey(addr))
    if (!info) { console.log(`${addr}: leer`); continue }
    console.log(`\n[${addr}]`)
    console.log('  Owner:', info.owner.toBase58())
    console.log('  Data length:', info.data.length)
    console.log('  Hex erste 64 bytes:', info.data.slice(0,64).toString('hex'))

    // Bekannte Whirlpool Position Layout prüfen (tickLower bei 88, tickUpper bei 92)
    if (info.data.length > 100) {
      const tickLower = info.data.readInt32LE(88)
      const tickUpper = info.data.readInt32LE(92)
      const liquidity = info.data.readBigUInt64LE(80)
      console.log('  [Whirlpool-Layout?] tickLower:', tickLower, 'tickUpper:', tickUpper, 'liquidity:', liquidity.toString())
    }
  }
}
check().catch(console.error)