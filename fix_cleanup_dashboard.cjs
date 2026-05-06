const fs = require('fs')

// 1. ByrealDashboard - nur noch ein Portfolio Link Button
const byreal = `export default function ByrealDashboard() {
  return (
    <a href="https://www.byreal.io/en/portfolio" target="_blank" rel="noreferrer" style={{
      display:'inline-block', marginTop:'0.75rem',
      background:'rgba(99,102,241,0.15)', color:'#6366f1', textDecoration:'none',
      padding:'0.4rem 1.2rem', borderRadius:'999px', fontWeight:600, fontSize:'0.85rem',
      border:'1px solid rgba(99,102,241,0.3)'
    }}>↗ Byreal Portfolio</a>
  )
}
`
fs.writeFileSync('src/components/ByrealDashboard.jsx', byreal)
console.log('✅ ByrealDashboard vereinfacht')

// 2. PoolDashboard - MeteoraDashboard und LendDashboard entfernen
let pd = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Imports entfernen
pd = pd.replace("import LendDashboard from './LendDashboard'\n", '')
pd = pd.replace("import MeteoraDashboard from './MeteoraDashboard'\n", '')

// JSX entfernen
pd = pd.replace(/<MeteoraDashboard[^/]*\/>/g, '')
pd = pd.replace(/<LendDashboard[^/]*\/>/g, '')
pd = pd.replace(/<MeteoraDashboard[\s\S]*?\/>/g, '')
pd = pd.replace(/<LendDashboard[\s\S]*?\/>/g, '')

fs.writeFileSync('src/components/PoolDashboard.jsx', pd)
console.log('✅ Meteora + LendDashboard entfernt')
console.log('Meteora noch drin:', pd.includes('<MeteoraDashboard'))
console.log('Lend noch drin:', pd.includes('<LendDashboard'))