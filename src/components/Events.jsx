import React, { useState, useEffect } from 'react'
import Loader from './Loader'

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

const normalizeEventType = (value) => {
  const raw = String(value ?? '').trim()
  const lowered = raw.toLowerCase()
  if (lowered === 'group') return 'Group'
  if (lowered === 'individual' || lowered === 'single') return 'Single'
  return raw
}

const buildEventPayload = ({
  eventName,
  category,
  eventType,
  eventDate,
  firstPrizePoints,
  secondPrizePoints,
  thirdPrizePoints,
  typeKey = 'eventType',
}) => ({
  eventName,
  category,
  [typeKey]: normalizeEventType(eventType),
  eventDate,
  firstPrizePoints: Number(firstPrizePoints) || 0,
  secondPrizePoints: Number(secondPrizePoints) || 0,
  thirdPrizePoints: Number(thirdPrizePoints) || 0,
})

/* ── tiny reusable styled input ── */
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

/* ── styled select ── */
const Select = ({ children, value, onChange, style }) => (
  <select
    value={value}
    onChange={onChange}
    style={{
      background: '#222',
      border: `1px solid ${BORDER}`,
      borderRadius: 6,
      color: value ? '#fff' : 'rgba(255,255,255,0.35)',
      padding: '10px 14px',
      fontSize: '0.88rem',
      fontFamily: 'inherit',
      outline: 'none',
      width: '100%',
      ...style,
    }}
  >
    {children}
  </select>
)

/* ── gold-outlined action button ── */
const OutlineBtn = ({ children, gold, disabled, onClick, style, ...rest }) => (
  <button
    onClick={onClick}
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

const Events = () => {
  const [events, setEvents] = useState([])
  const [eventName, setEventName] = useState('')
  const [category, setCategory] = useState('')
  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventSearch, setEventSearch] = useState('')
  const [firstPrizePoints, setFirstPrizePoints] = useState('')
  const [secondPrizePoints, setSecondPrizePoints] = useState('')
  const [thirdPrizePoints, setThirdPrizePoints] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeAddWinnerEvent, setActiveAddWinnerEvent] = useState(null)
  const [winnerName, setWinnerName] = useState('')
  const [winnerClass, setWinnerClass] = useState('')
  const [winnerPosition, setWinnerPosition] = useState(1)
  const [winnerHouseId, setWinnerHouseId] = useState(0)
  const [publishLoadingMap, setPublishLoadingMap] = useState({})
  const [houses, setHouses] = useState([])
  const [editingEventId, setEditingEventId] = useState(null)
  const [editEventName, setEditEventName] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editEventType, setEditEventType] = useState('')
  const [editEventDate, setEditEventDate] = useState('')
  const [editFirstPrizePoints, setEditFirstPrizePoints] = useState('')
  const [editSecondPrizePoints, setEditSecondPrizePoints] = useState('')
  const [editThirdPrizePoints, setEditThirdPrizePoints] = useState('')
  const [saveLoadingMap, setSaveLoadingMap] = useState({})
  const [deleteLoadingMap, setDeleteLoadingMap] = useState({})

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const showWarningPopup = (message) => {
    const text = String(message || 'Something went wrong')
    setError(text)
    if (typeof window !== 'undefined') window.alert(text)
  }

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await fetch(`${API_BASE}/Houses`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (res.ok) setHouses(await res.json())
      } catch (err) { /* ignore */ }
    }
    fetchHouses()
    const fetchEvents = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/Events`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`)
        const data = await res.json()
        setEvents(Array.isArray(data) ? data : data.items || [])
      } catch (err) {
        showWarningPopup(err.message || 'Failed to fetch events')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const addEvent = async (e) => {
    e.preventDefault()
    setError('')
    const payload = buildEventPayload({
      eventName,
      category,
      eventType,
      eventDate: eventDate ? new Date(eventDate).toISOString() : new Date().toISOString(),
      firstPrizePoints,
      secondPrizePoints,
      thirdPrizePoints,
      typeKey: 'eventType',
    })
    try {
      let res = await fetch(`${API_BASE}/Events`, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}),
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const fallbackPayload = buildEventPayload({
          eventName,
          category,
          eventType,
          eventDate: eventDate ? new Date(eventDate).toISOString() : new Date().toISOString(),
          firstPrizePoints,
          secondPrizePoints,
          thirdPrizePoints,
          typeKey: 'type',
        })
        res = await fetch(`${API_BASE}/Events`, {
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}),
          body: JSON.stringify(fallbackPayload),
        })
      }
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Create failed: ${res.status}`)
      }
      const created = await res.json()
      setEvents((s) => [created, ...s])
      setEventName('')
      setCategory('')
      setEventType('')
      setEventDate('')
      setFirstPrizePoints('')
      setSecondPrizePoints('')
      setThirdPrizePoints('')
    } catch (err) {
      showWarningPopup(err.message || 'Failed to create event')
    }
  }

  const publishEvent = async (id) => {
    const confirmed = typeof window !== 'undefined'
      ? window.confirm('Are you sure you want to publish this event?')
      : true
    if (!confirmed) return

    setPublishLoadingMap((m) => ({ ...m, [id]: true }))
    setError('')
    try {
      const res = await fetch(`${API_BASE}/Events/${id}/publish`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Publish failed: ${res.status}`)
      }
      setEvents((list) => list.map((ev) => (idsEqual(ev.id, id) || idsEqual(ev.eventId, id) ? { ...ev, isPublished: true } : ev)))
    } catch (err) {
      showWarningPopup(err.message || 'Failed to publish event')
    } finally {
      setPublishLoadingMap((m) => ({ ...m, [id]: false }))
    }
  }

  const toDateInputValue = (value) => {
    if (!value) return ''
    const dt = new Date(value)
    if (!Number.isNaN(dt.getTime())) return dt.toISOString().slice(0, 10)

    const ddmmyyyy = String(value).match(/^(\d{2})-(\d{2})-(\d{4})$/)
    if (ddmmyyyy) {
      const [, dd, mm, yyyy] = ddmmyyyy
      return `${yyyy}-${mm}-${dd}`
    }

    return ''
  }

  const startEditEvent = (ev) => {
    const id = normalizeId(ev.eventId ?? ev.id)
    setEditingEventId(id)
    setActiveAddWinnerEvent(null)
    setEditEventName(ev.eventName || ev.title || ev.name || '')
    setEditCategory(ev.category || '')
    setEditEventType(normalizeEventType(ev.eventType ?? ev.type))
    setEditEventDate(toDateInputValue(ev.eventDate))
    setEditFirstPrizePoints(String(ev.firstPrizePoints ?? ''))
    setEditSecondPrizePoints(String(ev.secondPrizePoints ?? ''))
    setEditThirdPrizePoints(String(ev.thirdPrizePoints ?? ''))
  }

  const cancelEditEvent = () => {
    setEditingEventId(null)
    setEditEventName('')
    setEditCategory('')
    setEditEventType('')
    setEditEventDate('')
    setEditFirstPrizePoints('')
    setEditSecondPrizePoints('')
    setEditThirdPrizePoints('')
  }

  const saveEvent = async (id) => {
    const normalizedId = normalizeId(id)
    if (normalizedId === null) return
    setSaveLoadingMap((m) => ({ ...m, [normalizedId]: true }))
    setError('')
    const existingEvent = events.find((ev) => idsEqual(ev.eventId ?? ev.id, normalizedId))
    const isoDate = editEventDate
      ? new Date(editEventDate).toISOString()
      : (existingEvent?.eventDate ?? new Date().toISOString())
    const payload = buildEventPayload({
      eventName: editEventName,
      category: editCategory,
      eventType: editEventType,
      eventDate: isoDate,
      firstPrizePoints: editFirstPrizePoints,
      secondPrizePoints: editSecondPrizePoints,
      thirdPrizePoints: editThirdPrizePoints,
      typeKey: 'eventType',
    })
    try {
      let res = await fetch(`${API_BASE}/Events/${normalizedId}`, {
        method: 'PUT',
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}),
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const fallbackPayload = buildEventPayload({
          eventName: editEventName,
          category: editCategory,
          eventType: editEventType,
          eventDate: isoDate,
          firstPrizePoints: editFirstPrizePoints,
          secondPrizePoints: editSecondPrizePoints,
          thirdPrizePoints: editThirdPrizePoints,
          typeKey: 'type',
        })
        res = await fetch(`${API_BASE}/Events/${normalizedId}`, {
          method: 'PUT',
          headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}),
          body: JSON.stringify(fallbackPayload),
        })
      }
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Update failed: ${res.status}`)
      }

      let updated = payload
      try {
        updated = await res.json()
      } catch {
        // Some APIs return 204 for PUT. Keep optimistic payload in that case.
      }

      setEvents((list) => list.map((ev) => {
        if (!idsEqual(ev.eventId ?? ev.id, normalizedId)) return ev
        return {
          ...ev,
          ...updated,
          eventId: ev.eventId ?? updated.eventId ?? normalizedId,
          id: ev.id ?? updated.id ?? normalizedId,
          eventName: updated.eventName ?? payload.eventName,
          category: updated.category ?? payload.category,
          eventType: normalizeEventType(updated.eventType ?? updated.type ?? payload.eventType),
          eventDate: updated.eventDate ?? payload.eventDate,
          firstPrizePoints: updated.firstPrizePoints ?? payload.firstPrizePoints,
          secondPrizePoints: updated.secondPrizePoints ?? payload.secondPrizePoints,
          thirdPrizePoints: updated.thirdPrizePoints ?? payload.thirdPrizePoints,
        }
      }))
      cancelEditEvent()
    } catch (err) {
      showWarningPopup(err.message || 'Failed to update event')
    } finally {
      setSaveLoadingMap((m) => ({ ...m, [normalizedId]: false }))
    }
  }

  const deleteEvent = async (id) => {
    const normalizedId = normalizeId(id)
    if (normalizedId === null) return
    const confirmed = window.confirm('Delete this event? This action cannot be undone.')
    if (!confirmed) return

    setDeleteLoadingMap((m) => ({ ...m, [normalizedId]: true }))
    setError('')
    try {
      const res = await fetch(`${API_BASE}/Events/${normalizedId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Delete failed: ${res.status}`)
      }
      setEvents((list) => list.filter((ev) => !idsEqual(ev.eventId ?? ev.id, normalizedId)))
      if (idsEqual(activeAddWinnerEvent, normalizedId)) setActiveAddWinnerEvent(null)
      if (idsEqual(editingEventId, normalizedId)) cancelEditEvent()
    } catch (err) {
      showWarningPopup(err.message || 'Failed to delete event')
    } finally {
      setDeleteLoadingMap((m) => ({ ...m, [normalizedId]: false }))
    }
  }

  const filteredEvents = events.filter((ev) => {
    const name = String(ev.eventName || ev.title || ev.name || '').toLowerCase()
    return name.includes(eventSearch.trim().toLowerCase())
  })

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
          }}>Events</h1>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.14em', color: GOLD, textTransform: 'uppercase' }}>
            Add New Event
          </p>
        </div>
      </div>

      {/* ── Add event form ── */}
      <form onSubmit={addEvent} style={{ marginBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          <Input placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} required />
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled>Category</option>
            <option value="Arts">Arts</option>
            <option value="Sports">Sports</option>
          </Select>
          <Select value={eventType} onChange={(e) => setEventType(normalizeEventType(e.target.value))}>
            <option value="" disabled>Type</option>
            <option value="Group">Group</option>
            <option value="Single">Single</option>
          </Select>
          <Input
            type="text"
            placeholder="dd-mm-yyyy"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            onFocus={(e) => { e.target.type = 'date' }}
            onBlur={(e) => { if (!e.target.value) e.target.type = 'text' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <Input type="number" placeholder="Points (First)" value={firstPrizePoints} onChange={(e) => setFirstPrizePoints(e.target.value)} />
          <Input type="number" placeholder="Points (Second)" value={secondPrizePoints} onChange={(e) => setSecondPrizePoints(e.target.value)} />
          <Input type="number" placeholder="Points (Third)" value={thirdPrizePoints} onChange={(e) => setThirdPrizePoints(e.target.value)} />
          <button
            type="submit"
            style={{
              background: 'transparent',
              border: `1px solid ${GOLD}`,
              color: GOLD,
              borderRadius: 6,
              padding: '10px 14px',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = '#000' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = GOLD }}
          >
            Add Event
          </button>
        </div>
      </form>

      {loading && <Loader text="Loading Events" />}

      <div style={{ marginBottom: 16, maxWidth: 380 }}>
        <Input
          placeholder="Search by event name"
          value={eventSearch}
          onChange={(e) => setEventSearch(e.target.value)}
        />
      </div>

      {/* ── Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            {['Name', 'Category', 'Type', 'Date', 'Actions'].map((h) => (
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
          {filteredEvents.length === 0 && !loading && (
            <tr>
              <td colSpan={5} style={{ padding: '24px 12px', color: '#555', fontSize: '0.9rem' }}>
                No matching events.
              </td>
            </tr>
          )}

          {filteredEvents.map((ev) => {
            const id = normalizeId(ev.eventId ?? ev.id)
            const displayType = normalizeEventType(ev.eventType ?? ev.type)
            return (
              <React.Fragment key={id || ev.eventName}>
                {/* ── Event row ── */}
                <tr
                  style={{
                    borderBottom: `1px solid rgba(255,255,255,0.05)`,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 12px', color: GOLD, fontWeight: 600, fontSize: '0.9rem' }}>
                    {ev.eventName || ev.title || ev.name}
                  </td>
                  <td style={{ padding: '16px 12px', color: '#d0d0d0', fontSize: '0.9rem' }}>{ev.category}</td>
                  <td style={{ padding: '16px 12px', color: '#d0d0d0', fontSize: '0.9rem' }}>{displayType}</td>
                  <td style={{ padding: '16px 12px', color: '#d0d0d0', fontSize: '0.9rem' }}>
                    {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : ''}
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <OutlineBtn
                        disabled={id === null || idsEqual(editingEventId, id) || saveLoadingMap[id] || deleteLoadingMap[id]}
                        onClick={() => startEditEvent(ev)}
                      >
                        {idsEqual(editingEventId, id) ? 'Editing' : 'Edit'}
                      </OutlineBtn>
                      <OutlineBtn
                        disabled={!id || saveLoadingMap[id] || deleteLoadingMap[id]}
                        onClick={() => deleteEvent(id)}
                      >
                        {deleteLoadingMap[id] ? 'Deleting…' : 'Delete'}
                      </OutlineBtn>
                      <OutlineBtn
                        disabled={ev.isPublished}
                        onClick={() => {
                          if (ev.isPublished) return
                          setActiveAddWinnerEvent(id)
                          setWinnerName('')
                          setWinnerClass('')
                          setWinnerPosition('')
                          setWinnerHouseId('')
                        }}
                      >
                        {ev.isPublished ? 'Add Winners (Closed)' : 'Add Winners'}
                      </OutlineBtn>
                      <OutlineBtn
                        gold={!ev.isPublished}
                        disabled={ev.isPublished || saveLoadingMap[id] || deleteLoadingMap[id]}
                        onClick={() => !ev.isPublished && publishEvent(id)}
                      >
                        {ev.isPublished ? 'Published' : publishLoadingMap[id] ? 'Publishing…' : 'Publish'}
                      </OutlineBtn>
                    </div>
                  </td>
                </tr>

                {idsEqual(editingEventId, id) && (
                  <tr>
                    <td colSpan={5} style={{ padding: '16px 12px', background: '#1c1c1c', borderBottom: `1px solid ${BORDER}` }}>
                      <p style={{ color: GOLD, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                        Edit Event — {ev.eventName}
                      </p>
                      <form
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, alignItems: 'center' }}
                        onSubmit={async (e) => {
                          e.preventDefault()
                          await saveEvent(id)
                        }}
                      >
                        <Input placeholder="Event Name" value={editEventName} onChange={(e) => setEditEventName(e.target.value)} required />
                        <Select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                          <option value="" disabled>Category</option>
                          <option value="Arts">Arts</option>
                          <option value="Sports">Sports</option>
                        </Select>
                        <Select value={editEventType} onChange={(e) => setEditEventType(normalizeEventType(e.target.value))}>
                          <option value="" disabled>Type</option>
                          <option value="Group">Group</option>
                          <option value="Single">Single</option>
                        </Select>
                        <Input type="date" value={editEventDate} onChange={(e) => setEditEventDate(e.target.value)} />

                        <Input type="number" placeholder="Points (First)" value={editFirstPrizePoints} onChange={(e) => setEditFirstPrizePoints(e.target.value)} />
                        <Input type="number" placeholder="Points (Second)" value={editSecondPrizePoints} onChange={(e) => setEditSecondPrizePoints(e.target.value)} />
                        <Input type="number" placeholder="Points (Third)" value={editThirdPrizePoints} onChange={(e) => setEditThirdPrizePoints(e.target.value)} />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                          <OutlineBtn gold type="submit" disabled={saveLoadingMap[id]}>
                            {saveLoadingMap[id] ? 'Saving…' : 'Save'}
                          </OutlineBtn>
                          <OutlineBtn type="button" onClick={cancelEditEvent}>Cancel</OutlineBtn>
                        </div>
                      </form>
                    </td>
                  </tr>
                )}

                {/* ── Inline add-winner row ── */}
                {idsEqual(activeAddWinnerEvent, id) && (
                  <tr>
                    <td colSpan={5} style={{ padding: '16px 12px', background: '#1c1c1c', borderBottom: `1px solid ${BORDER}` }}>
                      <p style={{ color: GOLD, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                        Add Winner — {ev.eventName}
                      </p>
                      <form
                        style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}
                        onSubmit={async (e) => {
                          e.preventDefault()
                          setError('')
                          try {
                            const payload = {
                              position: Number(winnerPosition) || 0,
                              houseId: Number(winnerHouseId) || 0,
                              participantName: winnerName,
                              className: winnerClass,
                            }
                            const chkRes = await fetch(`${API_BASE}/Winners/events/${activeAddWinnerEvent}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
                            let existing = []
                            if (chkRes.ok) {
                              const json = await chkRes.json()
                              existing = Array.isArray(json) ? json : json.winners || json.items || []
                            }
                            if (existing.some((w) => Number(w.houseId) === Number(payload.houseId))) {
                              throw new Error('House cannot win twice in the same event')
                            }
                            const res = await fetch(`${API_BASE}/Winners/events/${activeAddWinnerEvent}`, {
                              method: 'POST',
                              headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}),
                              body: JSON.stringify(payload),
                            })
                            if (!res.ok) {
                              const txt = await res.text()
                              throw new Error(txt || `Create winner failed: ${res.status}`)
                            }
                            await res.json()
                            setActiveAddWinnerEvent(null)
                          } catch (err) {
                            showWarningPopup(err.message || 'Failed to add winner')
                          }
                        }}
                      >
                        <Input placeholder="Participant Name" value={winnerName} onChange={(e) => setWinnerName(e.target.value)} required={displayType !== 'Group'} style={{ width: 180 }} />
                        <Input placeholder="Class" value={winnerClass} onChange={(e) => setWinnerClass(e.target.value)} style={{ width: 120 }} />
                        <Select value={winnerPosition} onChange={(e) => setWinnerPosition(e.target.value)} style={{ width: 120 }}>
                          <option value="" disabled>Position</option>
                          <option value="1">1st</option>
                          <option value="2">2nd</option>
                          <option value="3">3rd</option>
                        </Select>
                        <Select value={winnerHouseId} onChange={(e) => setWinnerHouseId(e.target.value)} style={{ width: 140 }}>
                          <option value="" disabled>House</option>
                          {houses.map((h) => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                          ))}
                        </Select>
                        <OutlineBtn gold type="submit">Save Winner</OutlineBtn>
                        <OutlineBtn type="button" onClick={() => setActiveAddWinnerEvent(null)}>Cancel</OutlineBtn>
                      </form>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Events
