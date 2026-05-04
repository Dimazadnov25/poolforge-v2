const fs=require("fs")

// usePool hook - refresh interval auf 1 sekunde
let up=fs.readFileSync("src/hooks/usePool.js","utf8")
console.log("usePool intervals:")
const matches=up.match(/setInterval[\s\S]{0,50}/g)
if(matches)matches.forEach(m=>console.log(m))