import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminNavbar from './AdminNavbar'

const AdminLayout = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', overflowY: 'auto' }}>
      <AdminNavbar />
      <main style={{ padding: '40px 40px' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
