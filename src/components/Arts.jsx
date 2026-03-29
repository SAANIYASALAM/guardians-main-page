import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Loader from './Loader'
import { getHouseColor } from '../utils/houseColors'
import vikingsLogo from '../assets/images/vikings.png'
import spartansLogo from '../assets/images/spartans.png'
import warriorsLogo from '../assets/images/warriors.png'
import gladiatorsLogo from '../assets/images/gladiators .png'

const getHouseLogo = (name) => {
  const lower = String(name || '').toLowerCase()
  if (lower.includes('viking')) return vikingsLogo
  if (lower.includes('spartan')) return spartansLogo
  if (lower.includes('warrior')) return warriorsLogo
  if (lower.includes('gladiator')) return gladiatorsLogo
  return null
}

const Arts = () => {
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [winners, setWinners] = useState([])
  const [events, setEvents] = useState([])
  const [winnersLoading, setWinnersLoading] = useState(true)
  const [winnersError, setWinnersError] = useState(null)
  const [selectedKey, setSelectedKey] = useState(null)
  const [winnerSearch, setWinnerSearch] = useState('')

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || '/api'
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    fetch(`${base}/Leaderboard/house-category-totals`, { headers })
      .then(async (res) => {
        const txt = await res.text()
        if (!res.ok) throw new Error(`${res.status} ${txt}`)
        return JSON.parse(txt)
      })
      .then((data) => setHouses(data?.houses || []))
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || '/api'
    const token = localStorage.getItem('token')
    setWinnersLoading(true)
    setWinnersError(null)
    fetch(`${base}/Winners`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(async (res) => {
        const txt = await res.text()
        if (!res.ok) throw new Error(`${res.status} ${txt}`)
        return JSON.parse(txt)
      })
      .then((data) => setWinners(data?.winners || data || []))
      .catch((err) => setWinnersError(err.message || String(err)))
      .finally(() => setWinnersLoading(false))
  }, [])

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || '/api'
    const token = localStorage.getItem('token')
    fetch(`${base}/Events`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(async (res) => {
        const txt = await res.text()
        if (!res.ok) throw new Error(`${res.status} ${txt}`)
        return JSON.parse(txt)
      })
      .then((data) => setEvents(Array.isArray(data) ? data : data?.items || []))
      .catch(() => setEvents([]))
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedKey(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (loading) return (
    <div className="flex w-screen h-screen items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-[#2a1e00]">
      <Loader text="Loading Arts Leaderboard" />
    </div>
  )
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>

  const arts = winners.filter((w) => {
    const categoryMatch = String((w.eventCategory || w.category || '')).toLowerCase() === 'arts'
    const published = w.isPublished ?? w.event?.isPublished ?? w.eventPublished ?? false
    return categoryMatch && published
  })
  const groups = arts.reduce((acc, w) => {
    const key = w.eventId ?? w.event?.id ?? w.eventName ?? `event-${w.eventId || Math.random()}`
    if (!acc[key]) acc[key] = { eventName: w.eventName || (w.event && w.event.name) || 'Event', eventType: w.eventType || w.event?.type || 'Single', items: [] }
    acc[key].items.push(w)
    return acc
  }, {})

  const groupKeys = Object.keys(groups)
  const filteredGroupKeys = groupKeys.filter((key) =>
    String(groups[key]?.eventName || '').toLowerCase().includes(winnerSearch.trim().toLowerCase())
  )
  const sortedHouses = [...houses].sort((a, b) => (b.artsPoints ?? 0) - (a.artsPoints ?? 0))
  const eventsById = events.reduce((acc, ev) => {
    const id = ev?.id ?? ev?.eventId
    if (id !== null && id !== undefined) acc[String(id)] = ev
    return acc
  }, {})
  const eventsByName = events.reduce((acc, ev) => {
    const name = String(ev?.eventName ?? ev?.name ?? '').trim().toLowerCase()
    if (name) acc[name] = ev
    return acc
  }, {})
  const getWinnerPoints = (item) => {
    const position = Number(item?.position)
    const eventId = item?.eventId ?? item?.event?.id ?? item?.event?.eventId
    const eventName = String(item?.eventName ?? item?.event?.name ?? '').trim().toLowerCase()
    const matchedEvent = (eventId !== null && eventId !== undefined ? eventsById[String(eventId)] : null) || eventsByName[eventName]
    if (!matchedEvent) return '-'
    if (position === 1) return matchedEvent?.firstPrizePoints ?? '-'
    if (position === 2) return matchedEvent?.secondPrizePoints ?? '-'
    if (position === 3) return matchedEvent?.thirdPrizePoints ?? '-'
    return '-'
  }

  return (
    <div className="relative min-h-[100vh] w-full bg-gradient-to-br from-black via-[#0a0a0a] to-[#2a1e00] font-sans overflow-x-hidden">
      <Navbar />
      <div className="relative w-full font-sans px-8 pb-8 text-white" style={{ paddingTop: '80px' }}>
        <h1 className="relative z-10 text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-white via-[rgb(212,176,91)] to-[rgba(212,176,91,0.6)] drop-shadow-[0_10px_20px_rgba(212,176,91,0.3)] text-center mb-10 pb-4" style={{ marginTop: '20px' }}>Arts Leaderboard</h1>
        <br />
        <div className="w-full flex justify-center mb-6">
          <div className="w-full max-w-[1400px] rounded-[1.5rem] backdrop-blur-2xl bg-gradient-to-r from-[rgba(10,10,10,0.8)] via-[rgba(30,25,10,0.6)] to-[rgba(10,10,10,0.8)] border border-[rgba(212,176,91,0.25)] shadow-[0_8px_32px_0_rgba(0,0,0,0.7),inset_0_2px_10px_rgba(212,176,91,0.1),inset_0_-2px_10px_rgba(0,0,0,0.5)] p-4 md:p-8 overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-light)', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.95rem', width: '50%', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>House</th>
                  <th style={{ padding: '16px 12px', color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 700, width: '50%', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Arts Points</th>
                </tr>
              </thead>
              <tbody>
                {sortedHouses.map((h, idx) => (
                  <tr key={h.houseId} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px 12px', fontWeight: 800, textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.05em', color: getHouseColor(h.houseName) }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '28px 160px', alignItems: 'center', justifyContent: 'center', gap: 10, width: 198, margin: '0 auto' }}>
                        {getHouseLogo(h.houseName) && (
                          <img
                            src={getHouseLogo(h.houseName)}
                            alt={`${h.houseName} logo`}
                            style={{ width: 28, height: 28, objectFit: 'contain' }}
                          />
                        )}
                        <span style={{ textAlign: 'center' }}>{h.houseName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem', textAlign: 'center' }}>{h.artsPoints ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full flex justify-center mt-32 mb-16">
          <div className="w-full max-w-[1400px]"> <br />
            <h2 className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-white via-[rgb(212,176,91)] to-[rgba(212,176,91,0.6)] drop-shadow-[0_10px_20px_rgba(212,176,91,0.3)] text-center mb-10 pb-4">Winners</h2> <br />

            <div className="w-full flex justify-center mb-24 pb-2 px-2 md:px-6">
              <input
                value={winnerSearch}
                onChange={(e) => setWinnerSearch(e.target.value)}
                placeholder="Search by event name"
                className="w-full max-w-[520px] rounded-2xl px-5 py-3.5 text-center text-[rgb(255,230,160)] placeholder:text-[rgba(255,230,160,0.48)] outline-none border border-[rgba(212,176,91,0.35)] bg-[linear-gradient(135deg,rgba(30,30,30,0.55),rgba(10,10,10,0.45))] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-xl focus:border-[rgba(212,176,91,0.62)] focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_0_3px_rgba(212,176,91,0.15),0_14px_34px_rgba(0,0,0,0.45)] transition-all duration-300"
              />
            </div>
            <br />

            {winnersLoading && <Loader text="Loading Winners" />}
            {winnersError && <div style={{ color: 'red' }}>Error: {winnersError}</div>}

            {!winnersLoading && !winnersError && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, alignItems: 'start' }}>
                {filteredGroupKeys.map((key) => {
                  const grp = groups[key]
                  const winnersForEvent = [...grp.items].sort((a, b) => (a.position || 0) - (b.position || 0))
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedKey(key)}
                      className="rounded-2xl backdrop-blur-2xl bg-gradient-to-b from-[rgba(20,20,20,0.8)] to-[rgba(5,5,5,0.9)] border border-[rgba(212,176,91,0.2)] shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(212,176,91,0.05)] cursor-pointer hover:-translate-y-1 hover:border-[rgba(212,176,91,0.4)] hover:shadow-[0_12px_40px_0_rgba(212,176,91,0.15)] transition-all duration-300 p-5 flex flex-col items-center min-h-[170px]"
                    >
                      <h3 className="text-[1.05rem] font-bold text-[rgb(212,176,91)] text-center tracking-wide mb-4 w-full border-b border-[rgba(212,176,91,0.2)] pb-3">
                        {grp.eventName}
                      </h3>
                      <div className="w-full flex justify-center items-center flex-grow">
                        <div className="w-full max-w-[200px] flex flex-col gap-2.5 justify-center">
                          {winnersForEvent.map((item) => (
                            <div key={item.id || `${item.participantName}-${item.position}`} className="grid grid-cols-2 w-full gap-4 items-center">
                              <div className="flex justify-center font-extrabold text-[rgb(212,176,91)] text-sm">#{item.position}</div>
                              <div className="flex justify-center font-semibold text-sm tracking-widest text-[rgb(255,230,160)]">
                                {String((grp.eventType || '').toLowerCase()) === 'single' ? (item.houseName ?? item.houseId) : (item.houseName || item.houseId)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal popup */}
        {selectedKey && groups[selectedKey] && (
          <div
            onClick={() => setSelectedKey(null)}
            style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(920px, 95%)',
                maxHeight: '85vh',
                overflow: 'auto',
                padding: '1.4rem 1.2rem',
                position: 'relative',
                borderRadius: 18,
                background: 'linear-gradient(140deg, rgba(26,26,26,0.72), rgba(10,10,10,0.68))',
                border: '1px solid rgba(212,176,91,0.35)',
                boxShadow: '0 20px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -10px 30px rgba(0,0,0,0.25)',
                backdropFilter: 'blur(24px) saturate(130%)',
                WebkitBackdropFilter: 'blur(24px) saturate(130%)',
              }}
            >
              <button onClick={() => setSelectedKey(null)} style={{ position: 'absolute', right: 14, top: 10, background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 20, lineHeight: 1, cursor: 'pointer', zIndex: 2 }}>x</button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 14, paddingRight: 0 }}>
                <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.3rem', textAlign: 'center' }}>{groups[selectedKey].eventName}</h3>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: '1px solid rgba(212,176,91,0.45)',
                  color: 'rgb(255,230,160)',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: 'rgba(212,176,91,0.12)',
                  whiteSpace: 'nowrap',
                }}>
                  {String((groups[selectedKey].eventType || '')).toLowerCase() === 'group' ? 'Group Event' : 'Single Event'}
                </span>
              </div>

              <div style={{ marginBottom: 12, color: 'var(--text-secondary)' }}>{groups[selectedKey].items.length} winner{groups[selectedKey].items.length !== 1 ? 's' : ''}</div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-light)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(212,176,91,0.22)' }}>
                      <th style={{ textAlign: 'left', padding: '10px 8px', width: 90, color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.08em' }}>Position</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.08em' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.08em' }}>Class</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', width: 180, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.08em' }}>House</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', width: 90, color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.08em' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups[selectedKey].items.sort((a, b) => (a.position || 0) - (b.position || 0)).map((item) => {
                      const isGroup = String((groups[selectedKey].eventType || '')).toLowerCase() === 'group'
                      const houseLabel = item.houseName ?? item.houseId ?? '-'
                      const houseColor = item.houseName ? getHouseColor(item.houseName) : 'var(--text-secondary)'
                      return (
                        <tr key={item.id || `${item.participantName}-${item.position}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--primary)' }}>{item.position || '-'}</td>
                          <td style={{ padding: '10px 8px', fontWeight: 600 }}>{isGroup ? '-' : (item.participantName || '-')}</td>
                          <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{isGroup ? '-' : (item.className || '-')}</td>
                          <td style={{ padding: '10px 8px', color: houseColor, fontWeight: 700 }}>{houseLabel}</td>
                          <td style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--primary)' }}>{getWinnerPoints(item)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Arts












