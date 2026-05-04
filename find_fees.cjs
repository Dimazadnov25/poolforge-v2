const fs=require("fs")
const f=fs.readFileSync("C:/Users/dzadn/poolforge-v2/src/components/PositionDetails.jsx","utf8")
let idx=0
while(true){
  const i=f.indexOf("Fees",idx+1)
  if(i===-1)break
  console.log("at",i,":",JSON.stringify(f.slice(i-20,i+150)))
  idx=i
}