const fs=require("fs")
let f=fs.readFileSync("C:/Users/dzadn/poolforge-v2/src/components/PositionDetails.jsx","utf8")
// Zeile 92: fehlendes > nach padding:'0.5rem'}
f=f.replace(
  "padding:'0.5rem'}\r\n          <div style={{color:'var(--muted)', fontSize:'0.7rem'}}>{feeA.toFixed(6)} SOL + {feeB.toFixed(4)} USDC</div>\r\n        </div>",
  "padding:'0.5rem'}}></div>"
)
fs.writeFileSync("C:/Users/dzadn/poolforge-v2/src/components/PositionDetails.jsx",f)
console.log("done")