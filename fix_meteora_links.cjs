const fs=require("fs")
let f=fs.readFileSync("C:/Users/dzadn/poolforge-v2/src/components/MeteoraDashboard.jsx","utf8")
const POOL="HTvjzsfX3yU6BUodCjZ5vZkUrAxMDTrBs3CJaq43ashR"
const links=`
      <div style={{textAlign:"center",marginTop:"0.75rem"}}>
        <div style={{color:"var(--muted)",fontSize:"0.72rem",marginBottom:"0.5rem"}}>Neue Position öffnen</div>
        <div style={{display:"flex",gap:"0.5rem",justifyContent:"center",flexWrap:"wrap"}}>
          {[1,4,10,20].map(bins=>(
            <a key={bins} href={"https://app.meteora.ag/dlmm/"+METEORA_URL.split("/").pop()+"?binRange="+bins} target="_blank" rel="noopener noreferrer"
              style={{padding:"0.3rem 0.7rem",borderRadius:"8px",background:"var(--surface)",color:"var(--muted)",fontSize:"0.78rem",fontWeight:"bold",textDecoration:"none",border:"1px solid var(--border)"}}>
              {bins} Bin
            </a>
          ))}
        </div>
      </div>`
f=f.replace(
  "</div>\n  )\n}",
  links+"\n    </div>\n  )\n}"
)
fs.writeFileSync("C:/Users/dzadn/poolforge-v2/src/components/MeteoraDashboard.jsx",f)
console.log("done")