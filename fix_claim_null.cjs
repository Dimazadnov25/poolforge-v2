const fs = require('fs')

// PositionDetails - auch bei null onUpdate aufrufen mit leerem Objekt
let pos = fs.readFileSync('src/components/PositionDetails.jsx', 'utf8')
pos = pos.replace(
  `const load = () => fetchPosition(position.mint).then(d => {
              setDetails(d)
              if (onUpdate) onUpdate(position.mint, d)
            }).catch(() => {})`,
  `const load = () => fetchPosition(position.mint).then(d => {
              if (d) {
                setDetails(d)
                if (onUpdate) onUpdate(position.mint, d)
                console.log('onUpdate called with feeOwedA:', d.feeOwedA, 'feeOwedB:', d.feeOwedB)
              } else {
                console.log('fetchPosition returned null for', position.mint)
              }
            }).catch(e => console.log('fetchPosition error:', e.message))`
)
fs.writeFileSync('src/components/PositionDetails.jsx', pos)
console.log('✅ Debug logging hinzugefügt')