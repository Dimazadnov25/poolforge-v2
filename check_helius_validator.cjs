async function check(){
  const r=await fetch("https://www.helius.dev/staking/rewards")
  console.log("status:",r.status)
  // Helius Validator Vote Account
  const r2=await fetch("https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method:"getVoteAccounts",params:[{commitment:"confirmed"}]})
  })
  const d=await r2.json()
  const helius=d.result?.current?.find(v=>v.nodePubkey&&v.commission===0)
  console.log("0% commission validators:",d.result?.current?.filter(v=>v.commission===0).length)
  console.log("Top 0% commission:",d.result?.current?.filter(v=>v.commission===0).slice(0,3).map(v=>({vote:v.votePubkey,stake:v.activatedStake})))
}
check().catch(console.error)