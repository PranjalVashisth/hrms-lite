import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

const http = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

export function extractError(err) {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data
    if (!d) return err.message
    if (d?.detail?.error) return d.detail.error
    if (d?.error)         return d.error
    if (Array.isArray(d?.detail)) {
      return d.detail
        .map(e => {
          const field = e.loc?.[e.loc.length - 1] ?? 'field'
          const msg   = e.msg.replace('Value error, ', '')
          return `${field}: ${msg}`
        })
        .join('; ')
    }
    if (typeof d?.detail === 'string') return d.detail
    return err.message
  }
  return String(err)
}

export const employeeApi = {
  list:   ()        => http.get('/employees').then(r => r.data),
  get:    (id)      => http.get(`/employees/${id}`).then(r => r.data),
  create: (payload) => http.post('/employees', payload).then(r => r.data),
  delete: (id)      => http.delete(`/employees/${id}`).then(r => r.data),
}

export const attendanceApi = {
  list: (params) =>
    http.get('/attendance', { params }).then(r => r.data),
  mark: (payload) =>
    http.post('/attendance', payload).then(r => ({ data: r.data, status: r.status })),
  summary: (id) =>
    http.get(`/attendance/${id}/summary`).then(r => r.data),
}

export const dashboardApi = {
  get: () => http.get('/dashboard').then(r => r.data),
}
