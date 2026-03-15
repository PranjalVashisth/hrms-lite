export function AttendanceBadge({ status }) {
  return <span className={`badge ${status === 'Present' ? 'badge-green' : 'badge-red'}`}>{status}</span>
}
export function DeptBadge({ dept }) {
  return <span className="badge badge-blue">{dept}</span>
}
