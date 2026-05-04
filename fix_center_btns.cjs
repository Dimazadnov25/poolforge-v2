const fs=require("fs")
let f=fs.readFileSync("src/components/MeteoraDashboard.jsx","utf8")
// AKTUELL button - gleiche styles wie POSITION + zentriert
f=f.replace(
  'display:"block",textAlign:"center",padding:"0.6rem",borderRadius:"8px",background:"rgba(0,200,100,0.15)",color:"#00c864",fontWeight:"bold",fontSize:"0.85rem",textDecoration:"none",border:"1px solid rgba(0,200,100,0.3)",marginBottom:"0.75rem"',
  'display:"inline-block",padding:"0.8rem 2.5rem",borderRadius:"10px",background:"rgba(0,200,100,0.15)",color:"#00c864",fontWeight:"bold",fontSize:"1.4rem",textDecoration:"none",border:"2px solid #00c864",textShadow:"0 0 10px #00c864",boxShadow:"0 0 15px rgba(0,200,100,0.3)",marginBottom:"0.75rem"'
)
// Wrap in centered div
f=f.replace(
  '<a href={url} target="_blank" rel="noopener noreferrer"\n              style={{display:"inline-block"',
  '<div style={{textAlign:"center",marginBottom:"0.75rem"}}><a href={url} target="_blank" rel="noopener noreferrer"\n              style={{display:"inline-block"'
)
f=f.replace(
  'AKTUELL\n            </a>\n            <PositionBtn',
  'AKTUELL\n            </a></div>\n            <PositionBtn'
)
fs.writeFileSync("src/components/MeteoraDashboard.jsx",f)
console.log("done")