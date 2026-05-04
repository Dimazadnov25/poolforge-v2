const fs=require("fs")
let f=fs.readFileSync("C:/Users/dzadn/poolforge-v2/src/components/PositionDetails.jsx","utf8")

// Value div zentrieren
f=f.replace(
  "<div style={{color:'var(--muted)', fontSize:'0.75rem'}}>Value</div>",
  "<div style={{color:'var(--muted)', fontSize:'0.75rem', textAlign:'center'}}>Value</div>"
)

// posValue div zentrieren  
f=f.replace(
  "<div style={{color:'#00d4ff', fontWeight:'bold', fontSize:'3rem', textShadow:'0 0 20px #00d4ff, 0 0 40px #00d4ff'}}>${posValue.toFixed(2)}</div>",
  "<div style={{color:'#00d4ff', fontWeight:'bold', fontSize:'3rem', textShadow:'0 0 20px #00d4ff, 0 0 40px #00d4ff', textAlign:'center'}}>${posValue.toFixed(2)}</div>"
)

// Parent div zentrieren
f=f.replace(
  "<div style={{color:'var(--muted)', fontSize:'0.7rem', textAlign:'center'}}>{details.solAmount.toFixed(4)} SOL + {details.usdcAmount.toFixed(2)} USDC</div>",
  "<div style={{color:'var(--muted)', fontSize:'0.7rem', textAlign:'center', width:'100%'}}>{details.solAmount.toFixed(4)} SOL + {details.usdcAmount.toFixed(2)} USDC</div>"
)

fs.writeFileSync("C:/Users/dzadn/poolforge-v2/src/components/PositionDetails.jsx",f)
console.log("done")