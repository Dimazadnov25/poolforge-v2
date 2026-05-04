const fs=require("fs")
let f=fs.readFileSync("src/components/MeteoraDashboard.jsx","utf8")
// Finde den Bin Links Block und ersetze ihn
const start=f.indexOf('<div style={{textAlign:"center"}}>')
const end=f.lastIndexOf('</div>')+6
const newBtn=`<div style={{textAlign:"center",marginTop:"0.75rem"}}>
              <a href="https://app.meteora.ag/dlmm/HTvjzsfX3yU6BUodCjZ5vZkUrAxMDTrBs3CJaq43ashR" target="_blank" rel="noopener noreferrer"
                style={{display:"inline-block",padding:"0.8rem 2.5rem",borderRadius:"10px",background:"rgba(0,200,100,0.15)",color:"#00c864",fontWeight:"bold",fontSize:"1.4rem",textDecoration:"none",border:"2px solid #00c864",textShadow:"0 0 10px #00c864",boxShadow:"0 0 15px rgba(0,200,100,0.3)"}}>
                Position
              </a>
            </div>`
console.log("start:",start,"end:",end)
console.log("block:",f.slice(start,start+100))