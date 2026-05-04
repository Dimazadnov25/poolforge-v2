const fs=require('fs')
let f=fs.readFileSync('src/components/PoolDashboard.jsx','utf8')
f=f.replace(
  '<StakeDashboard solPrice={pool.solPrice} solBalance={pool.solBalance} />\n          <MeteoraDashboard solPrice={pool.solPrice} />\n          <LendDashboard usdcBalance={pool.usdcBalance} />',
  '<MeteoraDashboard solPrice={pool.solPrice} />\n          <LendDashboard usdcBalance={pool.usdcBalance} />\n          <StakeDashboard solPrice={pool.solPrice} solBalance={pool.solBalance} />'
)
fs.writeFileSync('src/components/PoolDashboard.jsx',f,'utf8')
const f2=fs.readFileSync('src/components/PoolDashboard.jsx','utf8')
const pi=f2.indexOf('<PositionDetails'),mi=f2.indexOf('<MeteoraDashboard'),li=f2.indexOf('<LendDashboard'),si=f2.indexOf('<StakeDashboard')
console.log('Order ok:',pi<mi&&mi<li&&li<si)