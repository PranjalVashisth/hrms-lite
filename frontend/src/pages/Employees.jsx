import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Plus, Trash2, CalendarCheck, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { employeeApi, extractError } from '../services/api'
import { SkeletonTable } from '../components/Skeleton'
import Modal from '../components/Modal'
import Avatar from '../components/Avatar'
import { DeptBadge } from '../components/Badges'

const DEPTS = ['Engineering','Human Resources','Finance','Marketing','Operations','Product','Sales']

function AddEmployeeModal({ onClose, onSaved }) {
  const [form, setForm]     = useState({ employee_id: '', full_name: '', email: '', department: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const validate = () => {
    const errs = {}
    if (!form.employee_id.trim()) errs.employee_id = 'Required'
    if (!form.full_name.trim())   errs.full_name   = 'Required'
    if (!form.email.trim())       errs.email       = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (!form.department.trim())  errs.department  = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }
  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await employeeApi.create(form)
      toast.success(`${form.full_name} added successfully`)
      onSaved(); onClose()
    } catch (err) {
      const msg = extractError(err)
      if (msg.toLowerCase().includes('employee id')) setErrors(e => ({ ...e, employee_id: 'Already exists' }))
      else if (msg.toLowerCase().includes('email'))  setErrors(e => ({ ...e, email: 'Already in use' }))
      else toast.error(msg)
    } finally { setSaving(false) }
  }
  return (
    <Modal title="Add New Employee" onClose={onClose} footer={
      <>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Add Employee'}</button>
      </>
    }>
      <div className="form-grid">
        <div className="form-group">
          <label>Employee ID *</label>
          <input placeholder="e.g. EMP001" value={form.employee_id} onChange={set('employee_id')} className={errors.employee_id ? 'error' : ''} autoFocus />
          <span className="err-msg">{errors.employee_id}</span>
        </div>
        <div className="form-group">
          <label>Full Name *</label>
          <input placeholder="e.g. Alice Johnson" value={form.full_name} onChange={set('full_name')} className={errors.full_name ? 'error' : ''} />
          <span className="err-msg">{errors.full_name}</span>
        </div>
        <div className="form-group">
          <label>Email Address *</label>
          <input type="email" placeholder="alice@company.com" value={form.email} onChange={set('email')} className={errors.email ? 'error' : ''} />
          <span className="err-msg">{errors.email}</span>
        </div>
        <div className="form-group">
          <label>Department *</label>
          <input list="dept-suggestions" placeholder="e.g. Engineering" value={form.department} onChange={set('department')} className={errors.department ? 'error' : ''} />
          <datalist id="dept-suggestions">{DEPTS.map(d => <option key={d} value={d} />)}</datalist>
          <span className="err-msg">{errors.department}</span>
        </div>
      </div>
    </Modal>
  )
}

function DeleteModal({ employee, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    setDeleting(true)
    try {
      await employeeApi.delete(employee.employee_id)
      toast.success(`${employee.full_name} deleted`)
      onDeleted(); onClose()
    } catch (err) { toast.error(extractError(err)); onClose() }
  }
  return (
    <Modal title="Delete Employee" onClose={onClose} small footer={
      <>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete Employee'}</button>
      </>
    }>
      <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>
        Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{employee.full_name}</strong>?<br />
        All attendance records will also be deleted. This cannot be undone.
      </p>
    </Modal>
  )
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [search, setSearch]       = useState('')
  const [showAdd, setShowAdd]     = useState(false)
  const [toDelete, setToDelete]   = useState(null)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try { const data = await employeeApi.list(); setEmployees(data); setError('') }
    catch (err) { setError(extractError(err)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = search.trim()
    ? employees.filter(e => [e.full_name,e.employee_id,e.department,e.email].join(' ').toLowerCase().includes(search.toLowerCase()))
    : employees

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Employees</h2>
          <p>{employees.length} total employee{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Employee</button>
      </div>
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
          <input placeholder="Search by name, ID, email or department…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All Employees</div>
            <div className="card-sub">{search ? `${filtered.length} of ${employees.length} employees` : `${employees.length} employee${employees.length !== 1 ? 's' : ''}`}</div>
          </div>
        </div>
        {loading ? <SkeletonTable rows={5} cols={6} />
        : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <div className="empty-title">Failed to load employees</div>
            <div className="empty-sub">{error}</div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={load}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">��</div>
            <div className="empty-title">{search ? 'No results found' : 'No employees yet'}</div>
            <div className="empty-sub">{search ? 'Try a different search term' : 'Click "Add Employee" to get started'}</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Employee</th><th>Employee ID</th><th>Department</th><th>Email</th><th>Present / Total</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className="emp-cell">
                        <Avatar name={emp.full_name} department={emp.department} />
                        <div className="emp-cell-info">
                          <span className="emp-cell-name">{emp.full_name}</span>
                          <span className="emp-cell-id">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="td-mono">{emp.employee_id}</span></td>
                    <td><DeptBadge dept={emp.department} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{emp.email}</td>
                    <td>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{emp.present_days}</span>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}> / {emp.total_days} days</span>
                    </td>
                    <td><span className="td-mono">{format(parseISO(emp.created_at), 'dd MMM yyyy')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/attendance?employee_id=${emp.employee_id}`)}><CalendarCheck size={13} /> Attendance</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setToDelete(emp)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showAdd  && <AddEmployeeModal onClose={() => setShowAdd(false)} onSaved={load} />}
      {toDelete && <DeleteModal employee={toDelete} onClose={() => setToDelete(null)} onDeleted={load} />}
    </div>
  )
}
