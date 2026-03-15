function deptClass(dept) {
  const d = (dept || '').toLowerCase()
  if (d.includes('eng') || d.includes('tech')) return 'av-eng'
  if (d.includes('hr')  || d.includes('human')) return 'av-hr'
  if (d.includes('fin') || d.includes('acc'))  return 'av-fin'
  if (d.includes('mark')|| d.includes('sales')) return 'av-mkt'
  if (d.includes('ops') || d.includes('oper')) return 'av-ops'
  return 'av-other'
}
export function initials(name) {
  return (name || '?').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase()
}
export default function Avatar({ name, department, size = 34 }) {
  return (
    <div className={`avatar ${deptClass(department)}`} style={{ width: size, height: size, fontSize: size * 0.38, borderRadius: size * 0.26 }}>
      {initials(name)}
    </div>
  )
}
