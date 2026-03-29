import React from 'react';
import CongratulationsPage from './CongratulationsPage';
import spartansLogo from '../assets/images/spartans.png';
import vikingsLogo from '../assets/images/vikings.png';
import warriorsLogo from '../assets/images/warriors.png';

const entries = [
  {
    designation: 'Layatharang Champions',
    houseName: 'Spartans',
    logo: spartansLogo,
  },
  {
    designation: 'Chakravyuh (Overall) Champions',
    houseName: 'Vikings',
    logo: vikingsLogo,
  },
  {
    designation: 'Overall Runner Up',
    houseName: 'Warriors',
    logo: warriorsLogo,
  },
];

const OverallChampionsPage = () => {
  return <CongratulationsPage pageTitle="Champions and Runner Up" entries={entries} />;
};

export default OverallChampionsPage;