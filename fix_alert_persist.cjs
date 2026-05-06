const fs = require('fs')
let c = fs.readFileSync('src/components/PriceAlert.jsx', 'utf8')

// useState initialisierung aus localStorage laden
c = c.replace(
  'const [activeAlert, setActiveAlert] = useState(null)',
  "const [activeAlert, setActiveAlert] = useState(() => { try { const s = localStorage.getItem('pf_alert'); return s ? JSON.parse(s).pct : null } catch { return null } })"
)
c = c.replace(
  'const [refPrice, setRefPrice] = useState(null)',
  "const [refPrice, setRefPrice] = useState(() => { try { const s = localStorage.getItem('pf_alert'); return s ? JSON.parse(s).refPrice : null } catch { return null } })"
)

// Bei aktivieren in localStorage speichern
c = c.replace(
  'setActiveAlert(pct)\n      setRefPrice(solPrice)',
  "setActiveAlert(pct)\n      setRefPrice(solPrice)\n      localStorage.setItem('pf_alert', JSON.stringify({ pct, refPrice: solPrice }))"
)

// Bei deaktivieren localStorage löschen
c = c.replace(
  'setActiveAlert(null)\n      setRefPrice(null)',
  "setActiveAlert(null)\n      setRefPrice(null)\n      localStorage.removeItem('pf_alert')"
)

fs.writeFileSync('src/components/PriceAlert.jsx', c)
console.log('✅ localStorage Persistenz hinzugefügt')