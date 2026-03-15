export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{Array.from({ length: cols }, (_, i) => (<th key={i}><div className="skeleton" style={{ height: 10, width: '60%' }} /></th>))}</tr></thead>
        <tbody>{Array.from({ length: rows }, (_, r) => (<tr key={r}>{Array.from({ length: cols }, (_, c) => (<td key={c}><div className="skeleton" style={{ height: 13, width: `${55 + ((r + c) % 4) * 10}%` }} /></td>))}</tr>))}</tbody>
      </table>
    </div>
  )
}
export function SkeletonCards({ count = 4 }) {
  return (
    <div className="stats-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="stat-card">
          <div className="skeleton" style={{ height: 10, width: '50%', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 28, width: '40%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 10, width: '60%' }} />
        </div>
      ))}
    </div>
  )
}
