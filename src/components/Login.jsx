import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

const GOLD = '#E2B23F'
const BORDER = 'rgba(226,178,63,0.28)'

const StyledInput = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <label style={{
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: '#888',
    }}>
      {label}
    </label>
    <input
      {...props}
      style={{
        background: '#222',
        border: `1px solid ${BORDER}`,
        borderRadius: 6,
        color: '#fff',
        padding: '12px 14px',
        fontSize: '0.9rem',
        fontFamily: 'inherit',
        outline: 'none',
        width: '100%',
        transition: 'border-color 0.2s',
      }}
      onFocus={e => (e.target.style.borderColor = GOLD)}
      onBlur={e => (e.target.style.borderColor = BORDER)}
    />
  </div>
)

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url = `${API_BASE}/Auth/login`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const status = res.status
      const raw = await res.text()
      let parsed = null
      try { parsed = raw ? JSON.parse(raw) : null } catch { parsed = null }

      if (!res.ok) {
        let message = `HTTP ${status}`
        if (parsed) message = parsed.message || JSON.stringify(parsed)
        else if (raw) message = raw
        throw new Error(message || 'Login failed')
      }

      const data = parsed || {}
      if (data.token) localStorage.setItem('token', data.token)

      setLoading(false)
      navigate(from, { replace: true })
    } catch (err) {
      setLoading(false)
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      overflowY: 'auto',
      background: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Montserrat, sans-serif',
      padding: '40px 20px',
    }}>
      <div style={
        {
          width: '100%',
          maxWidth: 420,
          background: '#1a1a1a',
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: '40px 36px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }
      }>

        {/* ── Page heading ── */}
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 900,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#fff',
          lineHeight: 1,
          marginBottom: 6,
        }}>
          Login
        </h1>
        <p style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: GOLD,
          textTransform: 'uppercase',
          marginBottom: 36,
        }}>
          Admin Access
        </p>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: 'rgba(226,178,63,0.18)', marginBottom: 32 }} />

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <StyledInput
            label="Username"
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <StyledInput
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && (
            <div style={{
              color: '#ff6b6b',
              fontSize: '0.82rem',
              background: 'rgba(255,80,80,0.08)',
              borderRadius: 6,
              padding: '10px 14px',
              border: '1px solid rgba(255,80,80,0.2)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              width: '100%',
              background: 'transparent',
              border: `1px solid ${GOLD}`,
              color: GOLD,
              borderRadius: 6,
              padding: '13px 14px',
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.background = GOLD
                e.currentTarget.style.color = '#000'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = GOLD
            }}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
