const fs=require("fs")
let f=fs.readFileSync("C:/Users/dzadn/poolforge-v2/src/components/MeteoraDashboard.jsx","utf8")
const oldLinks=`[4,10,20].map(bins=>(
                  <a key={bins} href={url} target="_blank" rel="noopener noreferrer"
                    style={{padding:"0.3rem 0.8rem",borderRadius:"8px",background:"var(--surface)",color:"#00c864",fontSize:"0.82rem",fontWeight:"bold",textDecoration:"none",border:"1px solid rgba(0,200,100,0.3)"}}>
                    ±{bins} Bin
                  </a>
                ))`
const newLinks=`[
                  {bins:4,url:"https://app.meteora.ag/dlmm/5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6"},
                  {bins:10,url:"https://app.meteora.ag/dlmm/BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y"},
                  {bins:20,url:"https://app.meteora.ag/dlmm/BVRbyLjjfSBcoyiYFuxbgKYnWuiFaF9CSXEa5vdSZ9Hh"}
                ].map(({bins,url})=>(
                  <a key={bins} href={url} target="_blank" rel="noopener noreferrer"
                    style={{padding:"0.3rem 0.8rem",borderRadius:"8px",background:"var(--surface)",color:"#00c864",fontSize:"0.82rem",fontWeight:"bold",textDecoration:"none",border:"1px solid rgba(0,200,100,0.3)"}}>
                    ±{bins} Bin
                  </a>
                ))`
if(f.includes('[4,10,20]')){
  f=f.replace('[4,10,20].map(bins=>(',`[{bins:4,url:"https://app.meteora.ag/dlmm/5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6"},{bins:10,url:"https://app.meteora.ag/dlmm/BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y"},{bins:20,url:"https://app.meteora.ag/dlmm/BVRbyLjjfSBcoyiYFuxbgKYnWuiFaF9CSXEa5vdSZ9Hh"}].map(({bins,url})=>(`)
  f=f.replace('href={url}','href={url}')
  console.log("replaced [4,10,20]:",f.includes("5rCf1DM8"))
}else{
  console.log("NOT FOUND - current content around bins:")
  const idx=f.indexOf("Bin")
  console.log(f.slice(idx-200,idx+100))
}
fs.writeFileSync("C:/Users/dzadn/poolforge-v2/src/components/MeteoraDashboard.jsx",f)