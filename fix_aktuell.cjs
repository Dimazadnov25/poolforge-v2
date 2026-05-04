const fs=require("fs")
let f=fs.readFileSync("src/components/MeteoraDashboard.jsx","utf8")
const idx=f.indexOf("ffnen")
const start=f.lastIndexOf("<a ",idx)
const linkEnd=f.indexOf("</a>",idx)+4
// Finde den Text zwischen > und </a>
const textStart=f.lastIndexOf(">",linkEnd-5)+1
const textEnd=f.indexOf("<",textStart)
console.log("text:",JSON.stringify(f.slice(textStart,textEnd)))
f=f.slice(0,textStart)+"AKTUELL"+f.slice(textEnd)
fs.writeFileSync("src/components/MeteoraDashboard.jsx",f)
console.log("done")