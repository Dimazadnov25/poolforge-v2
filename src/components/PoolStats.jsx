export default function PoolStats({ pool }) {
  if (!pool) return null
  return (
    <div className="pool-stats" style={{gridTemplateColumns:'1fr'}}>
      <div className="stat-card">
        <div className="stat-label">Price</div>
        <div className="stat-value">${pool.currentPrice?.toFixed(4)}</div>
      </div>
    </div>
  )
}