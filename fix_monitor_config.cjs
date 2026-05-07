const fs = require('fs')
let c = fs.readFileSync('api/monitor-position.js', 'utf8')

c = c.replace(
  `    // Alert Config lesen
    const configPath = path.join(process.cwd(), 'alert-config.json')
    let config = { active: false }
    try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')) } catch(e) {}`,
  `    // Alert Config von GitHub lesen
    let config = { active: false }
    try {
      const r = await fetch('https://raw.githubusercontent.com/Dimazadnov25/poolforge-v2/main/alert-config.json?t=' + Date.now())
      config = await r.json()
    } catch(e) {}`
)

// fs und path imports entfernen
c = c.replace("import fs from 'fs'\nimport path from 'path'\n\n", '')

fs.writeFileSync('api/monitor-position.js', c)
console.log('✅ Config von GitHub gelesen')