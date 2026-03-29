import React from 'react';
import styles from './Hero.module.css';
import landingImg from '../assets/images/landing_landscape.png';
import FireEffect from './FireEffect';

const Hero = () => {
    const handleGetStarted = () => {
        const dashboardElement = document.getElementById('dashboard');
        if (dashboardElement) {
            dashboardElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section
            className={styles.hero}
            style={{ backgroundImage: `url(${landingImg})` }}
        >
            <FireEffect />
            <div className={styles.overlay}></div>
            <div className={styles.content}>
                <h1 className={styles.title}>LAYATHARANG</h1>
                <h2 className={styles.subtitle}>CHAKRAVYUH 2026</h2>

                <button className={styles.primaryBtn} onClick={handleGetStarted}>
                    Get Started
                </button>

                <div className={styles.statsContainer}>
                    <div className={`glass-card ${styles.statsCard}`}>
                        <div className={styles.statItem}>
                            <div className={styles.statHeader}>
                                <span className={styles.statIcon}>⚔️</span>
                                <span className={styles.statValue}>65+</span>
                            </div>
                            <span className={styles.statLabel}>Epic Events</span>
                        </div>

                        <div className={styles.statItem}>
                            <div className={styles.statHeader}>
                                <span className={styles.statIcon}>🔥</span>
                                <span className={styles.statValue}>10k</span>
                            </div>
                            <span className={styles.statLabel}>Participants Expected</span>
                        </div>

                        <div className={styles.statItem}>
                            <div className={styles.statHeader}>
                                <span className={styles.statIcon}>🏆</span>
                                <span className={styles.statValue}>₹5L+</span>
                            </div>
                            <span className={styles.statLabel}>In Prize Pool</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
