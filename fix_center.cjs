const fs=require("fs")
let f=fs.readFileSync("C:/Users/dzadn/poolforge-v2/src/components/PositionDetails.jsx","utf8")
// SOL + USDC Zeile zentrieren
f=f.replace(
  "{details.solAmount.toFixed(4)} SOL + {details.usdcAmount.toFixed(2)} USDC",
  "{details.solAmount.toFixed(4)} SOL + {details.usdcAmount.toFixed(2)} USDC"
)
// Finde den div der diese Zeile enthält und zentriere ihn
f=f.replace(
  "<div style={{color:'var(--muted)', fontSize:'0.7rem'}}>{details.solAmount.toFixed(4)} SOL + {details.usdcAmount.toFixed(2)} USDC</div>",
  "<div style={{color:'var(--muted)', fontSize:'0.7rem', textAlign:'center'}}>{details.solAmount.toFixed(4)} SOL + {details.usdcAmount.toFixed(2)} USDC</div>"
)
fs.writeFileSync("C:/Users/dzadn/poolforge-v2/src/components/PositionDetails.jsx",f)
console.log("done",f.includes("textAlign:'center'"))