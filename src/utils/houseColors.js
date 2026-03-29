export const getHouseColor = (name) => {
  const lower = String(name || '').toLowerCase();
  if (lower.includes('viking')) return '#023916'; // Green
  if (lower.includes('gladiator')) return '#44087b'; // Purple
  if (lower.includes('spartan')) return '#4f0808'; // Red
  if (lower.includes('warrior')) return '#082d69'; // Blue
  return 'var(--text-light)';
};
