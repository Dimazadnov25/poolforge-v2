export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { pct, refPrice, active } = req.method === 'POST' ? req.body : req.query
  const token = process.env.GITHUB_TOKEN
  const repo = 'Dimazadnov25/poolforge-v2'
  
  // Aktuelle Datei holen (für SHA)
  const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/alert-config.json`, {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
  })
  const fileData = await getRes.json()
  
  const content = Buffer.from(JSON.stringify({ pct: Number(pct), refPrice: Number(refPrice), active: active !== 'false' })).toString('base64')
  
  await fetch(`https://api.github.com/repos/${repo}/contents/alert-config.json`, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Update alert config', content, sha: fileData.sha })
  })
  
  res.json({ ok: true })
}
