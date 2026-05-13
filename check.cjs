const fs=require("fs");const c=fs.readFileSync("src/components/RaydiumDashboard.jsx","utf8");const idx=c.indexOf("placeholder=");console.log(c.substring(idx,idx+300));
