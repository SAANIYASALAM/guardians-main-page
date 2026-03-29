import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const GOLD = '#E2B23F'

const AdminNavbar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  const linkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    color: isActive ? GOLD : '#aaaaaa',
    fontWeight: isActive ? 600 : 400,
    fontSize: '0.85rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    transition: 'color 0.2s',
  })

  return (
    <nav style={{
      padding: '16px 32px',
      borderBottom: '1px solid rgba(226,178,63,0.15)',
      background: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      gap: 32,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Nav links */}
      <NavLink to="/admin" end style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/admin/events" style={linkStyle}>Events</NavLink>
      <NavLink to="/admin/winners" style={linkStyle}>Winners</NavLink>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          background: 'transparent',
          border: '1px solid rgba(226,178,63,0.35)',
          color: '#aaaaaa',
          borderRadius: 4,
          padding: '6px 18px',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#ff6b6b'
          e.currentTarget.style.color = '#ff6b6b'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(226,178,63,0.35)'
          e.currentTarget.style.color = '#aaaaaa'
        }}
      >
        Logout
      </button>
    </nav>
  )
}

export default AdminNavbar
