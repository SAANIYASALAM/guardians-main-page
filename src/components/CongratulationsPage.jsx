import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CongratulationsPage.module.css';

const CongratulationsPage = ({ pageTitle, entries, logoCentric = false }) => {
  return (
    <main className={styles.page}>
      <div className={styles.glowTop} aria-hidden="true" />
      <div className={styles.glowBottom} aria-hidden="true" />

      <section className={styles.container}>
        <p className={styles.college}>Govt. Model Engineering College</p>
        <h1 className={styles.congratulations}>Congratulations</h1>
        <h2 className={styles.pageTitle}>{pageTitle}</h2>

        <div className={`${styles.cardGrid} ${logoCentric ? styles.logoCentricGrid : ''}`}>
          {entries.map((entry) => (
            <article key={entry.designation} className={`${styles.card} ${logoCentric ? styles.logoCentricCard : ''}`}>
              <p className={styles.designation}>{entry.designation}</p>
              <img
                className={`${styles.houseLogo} ${logoCentric ? styles.logoCentricHouseLogo : ''}`}
                src={entry.logo}
                alt={`${entry.houseName} house logo`}
              />
              <p className={styles.houseName}>{entry.houseName}</p>
            </article>
          ))}
        </div>

      </section>
    </main>
  );
};

export default CongratulationsPage;