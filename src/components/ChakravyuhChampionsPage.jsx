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

const ChakravyuhChampionsPage = () => {
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

  const sortedBySports = useMemo(
    () =>
      [...houses].sort((a, b) => {
        const bySports = (b.sportsPoints ?? 0) - (a.sportsPoints ?? 0);
        if (bySports !== 0) return bySports;
        return (b.totalPoints ?? 0) - (a.totalPoints ?? 0);
      }),
    [houses]
  );

  const champion = sortedBySports[0];
  const entries = champion
    ? [
        {
          designation: `Chakravyuh Champion • ${champion.sportsPoints ?? 0} sports pts`,
          houseName: champion.houseName,
          logo: getHouseLogo(champion.houseName),
        },
      ]
    : [];

  return (
    <CongratulationsPage
      pageTitle={loading ? 'Loading Chakravyuh Champion...' : 'Chakravyuh Champion'}
      entries={entries}
      logoCentric
    />
  );
};

export default ChakravyuhChampionsPage;