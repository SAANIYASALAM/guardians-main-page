import React from 'react';
import styles from './FireEffect.module.css';

const FireEffect = () => {
    // Generate array for embers (more numerous, smaller)
    const embers = Array.from({ length: 150 }, (_, i) => i);

    // Generate array for smoke (fewer, larger)
    const smokePlumes = Array.from({ length: 20 }, (_, i) => i);

    return (
        <div className={styles.fireContainer}>
            {smokePlumes.map((_, index) => (
                <div
                    key={`smoke-${index}`}
                    className={styles.smoke}
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${15 + Math.random() * 10}s`,
                        transform: `scale(${1 + Math.random()})`
                    }}
                />
            ))}

            {embers.map((_, index) => (
                <div
                    key={`ember-${index}`}
                    className={styles.ember}
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 4}s`,
                        opacity: Math.random()
                    }}
                />
            ))}
        </div>
    );
};

export default FireEffect;
