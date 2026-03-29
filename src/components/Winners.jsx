import React, { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

/* ── shared style tokens ── */
const GOLD = '#E2B23F'
const GOLD_DIM = 'rgba(226,178,63,0.55)'
const BG = '#171717'
const BG_ROW = '#141414'
const BORDER = 'rgba(226,178,63,0.18)'

const normalizeId = (value) => {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? String(value) : numeric
}

const idsEqual = (a, b) => normalizeId(a) === normalizeId(b)

const Input = (props) => (
  <input
    {...props}
    style={{
      background: '#222',
      border: `1px solid ${BORDER}`,
      borderRadius: 6,
      color: '#fff',
      padding: '10px 14px',
      fontSize: '0.88rem',
      fontFamily: 'inherit',
      outline: 'none',
      width: '100%',
      ...props.style,
    }}
  />
)

const OutlineBtn = ({ children, gold, disabled, style, ...rest }) => (
  <button
    disabled={disabled}
    {...rest}
    style={{
      border: `1px solid ${gold ? GOLD : 'rgba(255,255,255,0.22)'}`,
      background: 'transparent',
      color: gold ? GOLD : 'rgba(255,255,255,0.7)',
      borderRadius: 4,
      padding: '6px 14px',
      fontSize: '0.72rem',
      letterSpacing: '0.08em',
      fontWeight: 700,
      textTransform: 'uppercase',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
      fontFamily: 'inherit',
      ...style,
    }}
  >
    {children}
  </button>
)

/* ── styled select ── */
const Select = ({ children, ...props }) => (
  <select
    {...props}
    style={{
      background: '#222',
      border: `1px solid ${BORDER}`,
      borderRadius: 6,
      color: '#fff',
      padding: '10px 14px',
      fontSize: '0.88rem',
      fontFamily: 'inherit',
      outline: 'none',
      width: '100%',
      ...props.style,
    }}
  >
    {children}
  </select>
)

const Winners = () => {
  const [winners, setWinners] = useState([])
  const [eventsMap, setEventsMap] = useState({})
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [winnerSearch, setWinnerSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingWinnerId, setEditingWinnerId] = useState(null)
  const [editParticipantName, setEditParticipantName] = useState('')
  const [editClassName, setEditClassName] = useState('')
  const [editPosition, setEditPosition] = useState('')
  const [editHouseId, setEditHouseId] = useState('')
  const [saveLoadingMap, setSaveLoadingMap] = useState({})
  const [deleteLoadingMap, setDeleteLoadingMap] = useState({})

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  useEffect(() => {
    const fetchEventsMap = async () => {
      try {
        const res = await fetch(`${API_BASE}/Events`, { headers })
        if (!res.ok) return
        const data = await res.json()
        const list = Array.isArray(data) ? data : data.items || []
        const map = {}
        list.forEach((ev) => {
          const id = ev.id ?? ev.eventId
          if (id != null) map[id] = ev
        })
        setEventsMap(map)
      } catch (err) {
        // ignore
      }
    }
    fetchEventsMap()

    const fetchWinners = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/Winners`, { headers })
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || `Failed to fetch winners: ${res.status}`)
        }
        const json = await res.json()
        const items = Array.isArray(json) ? json : json.winners || json.items || []
        setWinners(items)
      } catch (err) {
        setError(err.message || 'Failed to fetch winners')
      } finally {
        setLoading(false)
      }
    }
    fetchWinners()
  }, [])

  const startEditWinner = (winner) => {
    const id = normalizeId(winner.id ?? winner.winnerId)
    setEditingWinnerId(id)
    setEditParticipantName(winner.participantName ?? '')
    setEditClassName(winner.className ?? '')
    setEditPosition(String(winner.position ?? ''))
    setEditHouseId(String(winner.houseId ?? ''))
  }

  const cancelEditWinner = () => {
    setEditingWinnerId(null)
    setEditParticipantName('')
    setEditClassName('')
    setEditPosition('')
    setEditHouseId('')
  }

  const saveWinner = async (winner) => {
    const id = normalizeId(winner.id ?? winner.winnerId)
    if (id === null) return
    setSaveLoadingMap((m) => ({ ...m, [id]: true }))
    setError('')
    const payload = {
      eventId: Number(winner.eventId ?? winner.event?.id) || 0,
      position: Number(editPosition) || 0,
      houseId: Number(editHouseId) || 0,
      participantName: editParticipantName,
      className: editClassName,
    }
    try {
      const res = await fetch(`${API_BASE}/Winners/${id}`, {
        method: 'PUT',
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Update failed: ${res.status}`)
      }

      let updated = null
      try {
        updated = await res.json()
      } catch {
        // Some APIs return 204 for PUT.
      }

      setWinners((list) => list.map((w) => {
        const wid = normalizeId(w.id ?? w.winnerId)
        if (!idsEqual(wid, id)) return w
        return {
          ...w,
          ...updated,
          participantName: updated?.participantName ?? payload.participantName,
          className: updated?.className ?? payload.className,
          position: updated?.position ?? payload.position,
          houseId: updated?.houseId ?? payload.houseId,
        }
      }))
      cancelEditWinner()
    } catch (err) {
      setError(err.message || 'Failed to update winner')
    } finally {
      setSaveLoadingMap((m) => ({ ...m, [id]: false }))
    }
  }

  const deleteWinner = async (winner) => {
    const id = normalizeId(winner.id ?? winner.winnerId)
    if (id === null) return
    const confirmed = window.confirm('Delete this winner? This action cannot be undone.')
    if (!confirmed) return
    setDeleteLoadingMap((m) => ({ ...m, [id]: true }))
    setError('')
    try {
      const res = await fetch(`${API_BASE}/Winners/${id}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Delete failed: ${res.status}`)
      }
      setWinners((list) => list.filter((w) => !idsEqual(w.id ?? w.winnerId, id)))
      if (idsEqual(editingWinnerId, id)) cancelEditWinner()
    } catch (err) {
      setError(err.message || 'Failed to delete winner')
    } finally {
      setDeleteLoadingMap((m) => ({ ...m, [id]: false }))
    }
  }

  /* ── filter + group helpers ── */
  const filtered = winners.filter((w) => {
    const cat = (w.category || w.eventCategory || w.event?.category || eventsMap[w.eventId]?.category || '')
    const categoryMatch = !categoryFilter || categoryFilter === 'All' || String(cat).toLowerCase() === categoryFilter.toLowerCase()
    const eventName = w.eventName || w.event?.name || eventsMap[w.eventId]?.eventName || eventsMap[w.eventId]?.name || ''
    const houseName = w.houseName || ''
    const searchText = winnerSearch.trim().toLowerCase()
    const searchMatch = !searchText || [
      w.participantName,
      w.className,
      String(w.position ?? ''),
      eventName,
      houseName,
      String(w.houseId ?? ''),
    ].some((value) => String(value || '').toLowerCase().includes(searchText))
    return categoryMatch && searchMatch
  })

  const groups = filtered.reduce((acc, w) => {
    const key = w.eventId ?? w.event?.id ?? w.eventName ?? 'no-event'
    if (!acc[key]) acc[key] = { eventName: w.eventName || (w.event && w.event.name) || 'Event', items: [] }
    acc[key].items.push(w)
    return acc
  }, {})

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#fff', minHeight: '100vh' }}>

      {/* ── Page header row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{
            fontSize: '2.6rem',
            fontWeight: 900,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#fff',
            lineHeight: 1,
            marginBottom: 6,
          }}>Winners</h1>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.14em', color: GOLD, textTransform: 'uppercase' }}>
            Winners List
          </p>
        </div>
      </div>

      {/* ── Filters row ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: 200 }}>
          <option value="All">All</option>
          <option value="Arts">Arts</option>
          <option value="Sports">Sports</option>
        </Select>
        <Input
          value={winnerSearch}
          onChange={(e) => setWinnerSearch(e.target.value)}
          placeholder="Search winners, event, house..."
          style={{ width: 320 }}
        />
      </div>

      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: 16, fontSize: '0.85rem', background: 'rgba(255,80,80,0.08)', borderRadius: 6, padding: '10px 14px' }}>
          {error}
        </div>
      )}
      {loading && <div style={{ color: '#aaa', marginBottom: 16 }}>Loading winners…</div>}

      {/* ── Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            {['Participant', 'Class', 'Position', 'House', 'Actions'].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: h === 'Actions' ? 'right' : 'left',
                  padding: '10px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#888',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(groups).length === 0 && !loading && (
            <tr>
              <td colSpan={5} style={{ padding: '24px 12px', color: '#555', fontSize: '0.9rem' }}>
                No matching winners.
              </td>
            </tr>
          )}

          {Object.keys(groups).map((key) => {
            const group = groups[key]
            return (
              <React.Fragment key={`group-${key}`}>
                {/* ── Event group header ── */}
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: '20px 12px 8px',
                      textAlign: 'center',
                      color: GOLD,
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    {group.eventName}
                  </td>
                </tr>
                {group.items.map((w) => {
                  const winnerId = normalizeId(w.id ?? w.winnerId)
                  const houseLabel = w.houseName ?? eventsMap[w.eventId]?.houseName ?? w.houseId
                  return (
                    <React.Fragment key={winnerId ?? `${w.participantName}-${w.position}`}>
                      <tr
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px 12px', color: GOLD, fontWeight: 600, fontSize: '0.9rem' }}>{w.participantName}</td>
                        <td style={{ padding: '16px 12px', color: '#d0d0d0', fontSize: '0.9rem' }}>{w.className}</td>
                        <td style={{ padding: '16px 12px', color: '#d0d0d0', fontSize: '0.9rem' }}>{w.position}</td>
                        <td style={{ padding: '16px 12px', color: '#d0d0d0', fontSize: '0.9rem' }}>{houseLabel}</td>
                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <OutlineBtn
                              disabled={winnerId === null || idsEqual(editingWinnerId, winnerId) || saveLoadingMap[winnerId] || deleteLoadingMap[winnerId]}
                              onClick={() => startEditWinner(w)}
                            >
                              {idsEqual(editingWinnerId, winnerId) ? 'Editing' : 'Edit'}
                            </OutlineBtn>
                            <OutlineBtn
                              disabled={winnerId === null || saveLoadingMap[winnerId] || deleteLoadingMap[winnerId]}
                              onClick={() => deleteWinner(w)}
                            >
                              {deleteLoadingMap[winnerId] ? 'Deleting…' : 'Delete'}
                            </OutlineBtn>
                          </div>
                        </td>
                      </tr>

                      {idsEqual(editingWinnerId, winnerId) && (
                        <tr>
                          <td colSpan={5} style={{ padding: '16px 12px', background: '#1c1c1c', borderBottom: `1px solid ${BORDER}` }}>
                            <p style={{ color: GOLD, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                              Edit Winner — {w.participantName || 'Participant'}
                            </p>
                            <form
                              style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, alignItems: 'center' }}
                              onSubmit={async (e) => {
                                e.preventDefault()
                                await saveWinner(w)
                              }}
                            >
                              <Input placeholder="Participant" value={editParticipantName} onChange={(e) => setEditParticipantName(e.target.value)} required />
                              <Input placeholder="Class" value={editClassName} onChange={(e) => setEditClassName(e.target.value)} />
                              <Select value={editPosition} onChange={(e) => setEditPosition(e.target.value)}>
                                <option value="" disabled>Position</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                              </Select>
                              <Input type="number" placeholder="House ID" value={editHouseId} onChange={(e) => setEditHouseId(e.target.value)} required />
                              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <OutlineBtn gold type="submit" disabled={saveLoadingMap[winnerId]}>
                                  {saveLoadingMap[winnerId] ? 'Saving…' : 'Save'}
                                </OutlineBtn>
                                <OutlineBtn type="button" onClick={cancelEditWinner}>Cancel</OutlineBtn>
                              </div>
                            </form>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Winners
