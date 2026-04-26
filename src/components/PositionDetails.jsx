<div style={{marginBottom:'0.5rem'}}>
        <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'0.25rem'}}>
          <input type="number" value={addAmount} onChange={e=>setAddAmount(e.target.value)} placeholder="SOL" style={{flex:1,padding:'0.3rem',borderRadius:'6px',border:'1px solid var(--border)',background:'var(--surface)',color:'var(--text)'}}/>
          <button type="button" onClick={(e)=>{e.stopPropagation();setAddAmount(Math.max(0,(solBalance||0)-0.01).toFixed(4))}} style={{padding:'0.2rem 0.4rem',borderRadius:'6px',border:'1px solid var(--border)',background:'var(--surface)',color:'var(--text)',cursor:'pointer',fontSize:'0.7rem'}}>MAX</button>
        </div>
        <button type="button" className="btn btn-blue" style={{width:'100%'}} onClick={(e)=>{e.stopPropagation();if(addAmount&&onAddLiquidity){onAddLiquidity(position.mint,parseFloat(addAmount));setAddAmount('')}}}>Add Liquidity</button>
      </div><div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginBottom:'0.5rem'}}><div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}><button type="button" onClick={(e)=>{e.stopPropagation();setAddAmount(Math.max(0,(solBalance||0)-0.01).toFixed(4))}} style={{padding:"0.2rem 0.4rem",borderRadius:"6px",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",cursor:"pointer",fontSize:"0.7rem"}}>MAX SOL</button><input type="number" value={addAmount} onChange={e=>setAddAmount(e.target.value)} placeholder="SOL" style={{width:'80px',padding:'0.3rem',borderRadius:'6px',border:'1px solid var(--border)',background:'var(--surface)',color:'var(--text)'}}/></div><button className="btn btn-blue" onClick={(e)=>{e.stopPropagation();if(addAmount&&onAddLiquidity){onAddLiquidity(position.mint,parseFloat(addAmount));setAddAmount('')}}}>Add Liquidity</button></div>
        <button className="btn btn-green" onClick={() => onCollect && onCollect(position.mint)}>Collect Fees</button>
        <button className="btn btn-yellow" onClick={() => onRebalance && onRebalance(position.mint, 0.03)}>Rebalance 3%</button>
        <button className="btn btn-yellow" onClick={() => onRebalance && onRebalance(position.mint, 0.02)}>Rebalance 2%</button>
        
        <button className="btn btn-yellow" onClick={() => onRebalance && onRebalance(position.mint, 0.01)}>Rebalance 1%</button>
        <button className="btn btn-red" onClick={() => onClose && onClose(position.mint)}>Close Position</button>
      </div>
    </div>
  )
}