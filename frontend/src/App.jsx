import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="employees"  element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="*"          element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
