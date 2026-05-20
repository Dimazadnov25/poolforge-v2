const fs = require('fs')
const file = 'api/rebalance.js'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  `if (req.method !== 'POST') return res.status(405).end()

  const { secret } = req.body
  if (secret !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' })`,
  `const secret = req.body?.secret || req.query?.secret
  if (secret !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' })`
)

fs.writeFileSync(file, c)
console.log('✅ Cron GET Support eingebaut')