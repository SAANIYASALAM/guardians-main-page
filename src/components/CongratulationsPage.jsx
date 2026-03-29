import React, { useEffect, useState } from 'react';
import styles from './CongratulationsPage.module.css';

const CongratulationsPage = ({ pageTitle, entries, logoCentric = false, countdownSeconds = 5 }) => {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  useEffect(() => {
    setSecondsLeft(countdownSeconds);

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [countdownSeconds]);

  if (secondsLeft > 0) {
    return (
      <main className={styles.page}>
        <div className={styles.glowTop} aria-hidden="true" />
        <div className={styles.glowBottom} aria-hidden="true" />

        <section className={styles.countdownContainer}>
          <p className={styles.college}>Govt. Model Engineering College</p>
          <p className={styles.countdownLabel}>Loading Champions</p>
          <h1 className={styles.countdownNumber}>{secondsLeft}</h1>
          <p className={styles.countdownSubtext}>Please wait...</p>
        </section>
      </main>
    );
  }

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