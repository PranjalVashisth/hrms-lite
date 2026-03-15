import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarCheck, Menu, X } from 'lucide-react'
import { format } from 'date-fns'
const NAV = [
  { to: '/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard, section: 'Overview' },
  { to: '/employees',  label: 'Employees',  Icon: Users,            section: 'HR Operations' },
  { to: '/attendance', label: 'Attendance', Icon: CalendarCheck,    section: 'HR Operations' },
]
const PAGE_META = {
  '/dashboard':  { title: 'Dashboard',  sub: 'Overview of your workforce' },
  '/employees':  { title: 'Employees',  sub: 'Manage employee records' },
  '/attendance': { title: 'Attendance', sub: 'Track and manage daily attendance' },
}
export default function Layout() {
  const location = useLocation()
  const meta = PAGE_META[location.pathname] ?? { title: 'HRMS Lite', sub: '' }
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 900) setSidebarOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  const sections = [...new Set(NAV.map(n => n.section))]
  return (
    <div className="layout">
      <div className={`nav-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">H</div>
          <h1>HRMS Lite</h1>
          <p>Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {NAV.filter(n => n.section === section).map(({ to, label, Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <Icon size={15} />{label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="nav-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="topbar-left">
              <h2>{meta.title}</h2>
              <p>{meta.sub}</p>
            </div>
          </div>
          <span className="topbar-date">{format(new Date(), 'EEE, dd MMM yyyy')}</span>
        </header>
        <main className="page"><Outlet /></main>
      </div>
    </div>
  )
}
