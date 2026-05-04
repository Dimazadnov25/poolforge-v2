const fs=require("fs")
let f=fs.readFileSync("C:/Users/dzadn/poolforge-v2/src/components/PositionDetails.jsx","utf8")
// Fees Block entfernen - von <div> vor "Fees" bis zum schliessenden </div></div>
const start=f.indexOf("ontSize:'0.75rem'}}>Fees</div>")-50
const end=f.indexOf("</div>",f.indexOf("feeUSD.toFixed"))+6
console.log("start:",start,"end:",end)
console.log("removing:",JSON.stringify(f.slice(start,end)))
f=f.slice(0,start)+f.slice(end)
fs.writeFileSync("C:/Users/dzadn/poolforge-v2/src/components/PositionDetails.jsx",f)
console.log("done")