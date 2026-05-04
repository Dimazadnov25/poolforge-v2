const fs=require('fs')
let f=fs.readFileSync('src/components/PoolDashboard.jsx','utf8')
// MeteoraDashboard direkt nach PositionDetails (Whirlpool) verschieben
// Aktuell: MeteoraDashboard ist vor LendDashboard
// Wir wollen: PositionDetails -> MeteoraDashboard -> LendDashboard -> StakeDashboard
const idx=f.indexOf('<MeteoraDashboard')
console.log('Meteora JSX found:',idx)
console.log(f.slice(idx-20,idx+50))