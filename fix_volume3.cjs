const fs = require('fs')
const path = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(path, 'utf8')

// useEffect zum Import hinzufügen
c = c.replace(
  "import { useState, useCallback } from 'react'",
  "import { useState, useCallback, useEffect } from 'react'"
)

// React.useState -> useState
c = c.replace('React.useState(null)', 'useState(null)')

// React.useEffect -> useEffect
c = c.replace('React.useEffect(() => {', 'useEffect(() => {')

fs.writeFileSync(path, c)
console.log('✅ Fertig')