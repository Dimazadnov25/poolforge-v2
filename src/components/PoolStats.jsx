export default function PoolStats({ pool }) {
  if (!pool) return null;
  return (
    <div className="pool-stats">
      <div className="stat-card">
        <div className="stat-label">Current Tick</div>
        <div className="stat-value">{pool.currentTick}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Price</div>
        <div className="stat-value"></div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Tick Spacing</div>
        <div className="stat-value">{pool.tickSpacing}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Fee Rate</div>
        <div className="stat-value">{(pool.feeRate * 100).toFixed(2)}%</div>
      </div>
    </div>
  );
}
