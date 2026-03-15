import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { dashboardApi, extractError } from '../services/api'
import { SkeletonCards } from '../components/Skeleton'
import { AttendanceBadge } from '../components/Badges'
import Avatar from '../components/Avatar'

export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    dashboardApi.get()
      .then(setData)
      .catch(e => setError(extractError(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div>
      <SkeletonCards count={4} />
      <div className="two-col">
        {[0,1].map(i => (
          <div key={i} className="card">
            <div className="card-header"><div className="skeleton" style={{ height: 14, width: 180 }} /></div>
            <div className="card-body">
              {[0,1,2].map(j => <div key={j} className="skeleton" style={{ height: 12, marginBottom: 14, width: `${60+j*10}%` }} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="empty-state">
      <div className="empty-icon">⚠</div>
      <div className="empty-title">Failed to load dashboard</div>
      <div className="empty-sub">{error}</div>
    </div>
  )

  if (!data) return null

  const stats = [
    { label: 'Total Employees', value: data.total_employees, sub: 'Active records',  dot: null },
    { label: 'Present Today',   value: data.today_present,   sub: 'Marked present',  dot: 'var(--green)' },
    { label: 'Absent Today',    value: data.today_absent,    sub: 'Marked absent',   dot: 'var(--red)' },
    { label: 'Departments',     value: data.departments.length, sub: 'Active teams', dot: null },
  ]

  return (
    <div>
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-sub">
              {s.dot && <span className="stat-dot" style={{ background: s.dot }} />}
              {s.sub}
            </div>
          </div>
        ))}
      </div>
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Employees by Department</div>
              <div className="card-sub">{data.departments.length} department{data.departments.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <div className="card-body">
            {data.departments.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div className="empty-title">No employees yet</div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/employees')}>Add Employee</button>
              </div>
            ) : (
              data.departments.map(d => {
                const pct = data.total_employees > 0 ? Math.round((d.count / data.total_employees) * 100) : 0
                return (
                  <div key={d.department} className="bar-row">
                    <div className="bar-label-row">
                      <span className="bar-label">{d.department}</span>
                      <span className="bar-count">{d.count} employee{d.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                  </div>
                )
              })
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Attendance</div>
              <div className="card-sub">Last {data.recent_attendance.length} records</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/attendance')}>View All</button>
          </div>
          <div className="card-body-flush">
            {data.recent_attendance.length === 0 ? (
              <div className="empty-state">
                <div className="empty-title">No records yet</div>
                <div className="empty-sub">Mark attendance to get started</div>
              </div>
            ) : (
              <table>
                <tbody>
                  {data.recent_attendance.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <div className="emp-cell">
                          <Avatar name={r.full_name} department={r.department} size={32} />
                          <div className="emp-cell-info">
                            <span className="emp-cell-name">{r.full_name}</span>
                            <span className="emp-cell-id">{r.department}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="td-mono">{format(parseISO(r.date), 'dd MMM yyyy')}</span></td>
                      <td><AttendanceBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
