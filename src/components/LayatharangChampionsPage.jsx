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

const LayatharangChampionsPage = () => {
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

  const sortedByArts = useMemo(
    () =>
      [...houses].sort((a, b) => {
        const byArts = (b.artsPoints ?? 0) - (a.artsPoints ?? 0);
        if (byArts !== 0) return byArts;
        return (b.totalPoints ?? 0) - (a.totalPoints ?? 0);
      }),
    [houses]
  );

  const champion = sortedByArts[0];
  const entries = champion
    ? [
        {
          designation: `Layatharang Champion • ${champion.artsPoints ?? 0} arts pts`,
          houseName: champion.houseName,
          logo: getHouseLogo(champion.houseName),
        },
      ]
    : [];

  return (
    <CongratulationsPage
      pageTitle={loading ? 'Loading Layatharang Champion...' : 'Layatharang Champion'}
      entries={entries}
      logoCentric
    />
  );
};

export default LayatharangChampionsPage;