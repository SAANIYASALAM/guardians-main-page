import React, { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

const GOLD = '#E2B23F'
const BORDER = 'rgba(226,178,63,0.18)'

const ScheduleTable = ({ title, events, loading }) => {
  const [eventSearch, setEventSearch] = useState('')
  const filteredEvents = events.filter((ev) =>
    String(ev.eventName || ev.name || '').toLowerCase().includes(eventSearch.trim().toLowerCase())
  )

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 900,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#fff',
          lineHeight: 1,
          marginBottom: 4,
        }}>{title}</h2>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', color: GOLD, textTransform: 'uppercase' }}>
          Schedule
        </p>
      </div>

      <div style={{ marginBottom: 16, maxWidth: 340 }}>
        <input
          value={eventSearch}
          onChange={(e) => setEventSearch(e.target.value)}
          placeholder="Search events by name"
          style={{
            width: '100%',
            background: '#222',
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            color: '#fff',
            padding: '10px 14px',
            fontSize: '0.88rem',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
      </div>

      {loading && <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Loading…</div>}

      {!loading && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            {['Event Name', 'Type', 'Date', 'Points (1st / 2nd / 3rd)', 'Status'].map((h) => (
              <th key={h} style={{
                textAlign: 'left',
                padding: '10px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#888',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredEvents.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '24px 12px', color: '#555', fontSize: '0.9rem' }}>
                No matching events found.
              </td>
            </tr>
          ) : filteredEvents.map((ev) => (
            <tr
              key={ev.eventId ?? ev.id}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '14px 12px', color: GOLD, fontWeight: 600, fontSize: '0.9rem' }}>
                {ev.eventName || ev.name}
              </td>
              <td style={{ padding: '14px 12px', color: '#d0d0d0', fontSize: '0.9rem' }}>{ev.eventType}</td>
              <td style={{ padding: '14px 12px', color: '#d0d0d0', fontSize: '0.9rem' }}>
                {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </td>
              <td style={{ padding: '14px 12px', color: '#d0d0d0', fontSize: '0.9rem' }}>
                {ev.firstPrizePoints} / {ev.secondPrizePoints} / {ev.thirdPrizePoints}
              </td>
              <td style={{ padding: '14px 12px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em' }}>
                <span style={{
                  color: ev.isPublished ? '#4ade80' : '#facc15',
                  background: ev.isPublished ? 'rgba(74,222,128,0.1)' : 'rgba(250,204,21,0.1)',
                  border: `1px solid ${ev.isPublished ? 'rgba(74,222,128,0.3)' : 'rgba(250,204,21,0.3)'}`,
                  borderRadius: 4,
                  padding: '3px 10px',
                  textTransform: 'uppercase',
                }}>
                  {ev.isPublished ? 'Published' : 'Upcoming'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  )
}

const AdminPage = () => {
  const [artsEvents, setArtsEvents] = useState([])
  const [sportsEvents, setSportsEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/Events`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : data.items || []
        const byLatestDate = (a, b) => {
          const da = a?.eventDate ? new Date(a.eventDate).getTime() : 0
          const db = b?.eventDate ? new Date(b.eventDate).getTime() : 0
          return db - da
        }
        setArtsEvents(
          [...list.filter(ev => String(ev.category).toLowerCase() === 'arts')].sort(byLatestDate)
        )
        setSportsEvents(
          [...list.filter(ev => String(ev.category).toLowerCase() === 'sports')].sort(byLatestDate)
        )
      } catch (err) {
        // silently fail on dashboard
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#fff', minHeight: '100vh' }}>
      <ScheduleTable title="Arts" events={artsEvents} loading={loading} />
      <ScheduleTable title="Sports" events={sportsEvents} loading={loading} />
    </div>
  )
}

export default AdminPage
