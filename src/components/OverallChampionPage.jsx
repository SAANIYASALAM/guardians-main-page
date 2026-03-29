import React, { useEffect, useMemo, useState } from 'react';
import CongratulationsPage from './CongratulationsPage';
import vikingsLogo from '../assets/images/vikings.png';
import spartansLogo from '../assets/images/spartans.png';
import warriorsLogo from '../assets/images/warriors.png';
import gladiatorsLogo from '../assets/images/gladiators .png';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const getHouseLogo = (name) => {
  const lower = String(name || '').toLowerCase();
  if (lower.includes('viking')) return vikingsLogo;
  if (lower.includes('spartan')) return spartansLogo;
  if (lower.includes('warrior')) return warriorsLogo;
  if (lower.includes('gladiator')) return gladiatorsLogo;
  return null;
};

const OverallChampionPage = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/Leaderboard/house-category-totals`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch totals');
        return res.json();
      })
      .then((data) => setHouses(data?.houses || []))
      .catch(() => setHouses([]))
      .finally(() => setLoading(false));
  }, []);

  // totalPoints already includes arts + sports totals from backend response
  const sorted = useMemo(
    () => [...houses].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0)),
    [houses]
  );

  const champion = sorted[0];
  const entries = champion
    ? [
        {
          designation: `Overall Champion • ${champion.totalPoints ?? 0} pts`,
          houseName: champion.houseName,
          logo: getHouseLogo(champion.houseName),
        },
      ]
    : [];

  return (
    <CongratulationsPage
      pageTitle={loading ? 'Loading Overall Champion...' : 'Overall Champion'}
      entries={entries}
      logoCentric
    />
  );
};

export default OverallChampionPage;