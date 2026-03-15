import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { employeeApi, attendanceApi, extractError } from '../services/api'
import { SkeletonTable } from '../components/Skeleton'
import { AttendanceBadge, DeptBadge } from '../components/Badges'
import Avatar from '../components/Avatar'

const todayISO = () => new Date().toISOString().split('T')[0]

export default function Attendance() {
  const [searchParams]              = useSearchParams()
  const [employees, setEmployees]   = useState([])
  const [formEmpId, setFormEmpId]   = useState(searchParams.get('employee_id') ?? '')
  const [formDate, setFormDate]     = useState(todayISO())
  const [formStatus, setFormStatus] = useState('Present')
  const [formErrors, setFormErrors] = useState({})
  const [marking, setMarking]       = useState(false)
  const [records, setRecords]       = useState([])
  const [loadingRec, setLoadingRec] = useState(true)
  const [recError, setRecError]     = useState('')
  const [filterEmp, setFilterEmp]   = useState(searchParams.get('employee_id') ?? '')
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => { employeeApi.list().then(setEmployees).catch(() => {}) }, [])

  const loadRecords = useCallback(async () => {
    setLoadingRec(true)
    try {
      const params = {}
      if (filterEmp)  params.employee_id = filterEmp
      if (filterDate) params.date        = filterDate
      setRecords(await attendanceApi.list(params))
      setRecError('')
    } catch (err) { setRecError(extractError(err)) }
    finally { setLoadingRec(false) }
  }, [filterEmp, filterDate])

  useEffect(() => { loadRecords() }, [loadRecords])

  const handleMark = async () => {
    const errs = {}
    if (!formEmpId) errs.employee_id = 'Select an employee'
    if (!formDate)  errs.date        = 'Date is required'
    setFormErrors(errs)
    if (Object.keys(errs).length) return
    setMarking(true)
    try {
      const result = await attendanceApi.mark({ employee_id: formEmpId, date: formDate, status: formStatus })
      const emp = employees.find(e => e.employee_id === formEmpId)
      toast.success(`Attendance ${result.status === 201 ? 'marked' : 'updated'} — ${emp?.full_name ?? formEmpId}, ${format(parseISO(formDate), 'dd MMM yyyy')}: ${formStatus}`)
      loadRecords()
    } catch (err) { toast.error(extractError(err)) }
    finally { setMarking(false) }
  }

  const summaryMap = {}
  records.forEach(r => {
    if (!summaryMap[r.employee_id]) summaryMap[r.employee_id] = { present: 0, total: 0 }
    summaryMap[r.employee_id].total++
    if (r.status === 'Present') summaryMap[r.employee_id].present++
  })

  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Mark Attendance</div>
            <div className="card-sub">Record present or absent status for an employee</div>
          </div>
        </div>
        <div className="card-body">
          <div className="form-grid" style={{ maxWidth: 680 }}>
            <div className="form-group">
              <label>Employee *</label>
              <select value={formEmpId} onChange={e => setFormEmpId(e.target.value)} className={formErrors.employee_id ? 'error' : ''}>
                <option value="">Select employee…</option>
                {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name} ({e.employee_id})</option>)}
              </select>
              <span className="err-msg">{formErrors.employee_id}</span>
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input type="date" value={formDate} max={todayISO()} onChange={e => setFormDate(e.target.value)} className={formErrors.date ? 'error' : ''} />
              <span className="err-msg">{formErrors.date}</span>
            </div>
            <div className="form-group">
              <label>Status *</label>
              <select value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div className="form-group" style={{ justifyContent: 'flex-end', paddingTop: 20 }}>
              <button className="btn btn-primary" onClick={handleMark} disabled={marking}>{marking ? 'Saving…' : 'Mark Attendance'}</button>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Attendance Records</div>
            <div className="card-sub">{records.length} record{records.length !== 1 ? 's' : ''}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadRecords} disabled={loadingRec}>
            <RefreshCw size={13} style={{ animation: loadingRec ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)} style={{ minWidth: 200 }}>
              <option value="">All employees</option>
              {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name} ({e.employee_id})</option>)}
            </select>
            <input type="date" value={filterDate} max={todayISO()} onChange={e => setFilterDate(e.target.value)} style={{ minWidth: 160 }} />
            {(filterEmp || filterDate) && <button className="btn btn-ghost btn-sm" onClick={() => { setFilterEmp(''); setFilterDate('') }}>Clear filters</button>}
          </div>
        </div>
        {loadingRec ? <SkeletonTable rows={5} cols={6} />
        : recError ? (
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <div className="empty-title">Failed to load records</div>
            <div className="empty-sub">{recError}</div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={loadRecords}>Retry</button>
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No records found</div>
            <div className="empty-sub">{filterEmp || filterDate ? 'Try removing filters' : 'Mark attendance above to get started'}</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Employee</th><th>Department</th><th>Date</th><th>Status</th><th>Present / Total</th><th>Last updated</th></tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const s = summaryMap[r.employee_id] ?? { present: 0, total: 0 }
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="emp-cell">
                          <Avatar name={r.full_name ?? r.employee_id} department={r.department ?? ''} size={32} />
                          <div className="emp-cell-info">
                            <span className="emp-cell-name">{r.full_name ?? '—'}</span>
                            <span className="emp-cell-id">{r.employee_id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{r.department ? <DeptBadge dept={r.department} /> : '—'}</td>
                      <td><span className="td-mono">{format(parseISO(r.date), 'dd MMM yyyy')}</span></td>
                      <td><AttendanceBadge status={r.status} /></td>
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{s.present}</span>
                        <span style={{ fontSize: 12, color: 'var(--text3)' }}> / {s.total} days</span>
                      </td>
                      <td><span className="td-mono" style={{ fontSize: 11 }}>{format(parseISO(r.updated_at), 'dd MMM, HH:mm')}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
