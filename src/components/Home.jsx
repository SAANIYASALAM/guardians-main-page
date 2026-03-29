import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Navbar from './Navbar';
import logo from '../assets/images/Guardians_logo.png';
import { getHouseColor } from '../utils/houseColors';
import Loader from './Loader';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const RANK_COLOR = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function Home() {
  const mountRef = useRef(null);
  const logoRef = useRef(null);
  const [houses, setHouses] = useState([]);
  const sortedHouses = [...houses].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/Leaderboard/house-category-totals`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        const list = (data?.houses || []).slice().sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));
        setHouses(list);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    // ---- 1. SETUP SCENE, CAMERA, RENDERER ----
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    // ---- 2. CREATE PROFESSIONAL PARTICLE NETWORK ----
    const group = new THREE.Group();
    scene.add(group);

    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalY = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1200;
      originalY[i] = positions[i * 3 + 1];
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvasTexture = document.createElement('canvas');
    canvasTexture.width = 32;
    canvasTexture.height = 32;
    const context = canvasTexture.getContext('2d');
    const radGradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    radGradient.addColorStop(0, 'rgba(255,255,255,1)');
    radGradient.addColorStop(0.2, 'rgba(255, 215, 0, 1)');
    radGradient.addColorStop(0.5, 'rgba(218, 165, 32, 0.4)');
    radGradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = radGradient;
    context.fillRect(0, 0, 32, 32);

    const starTexture = new THREE.CanvasTexture(canvasTexture);

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffe666,
      size: 15,
      map: starTexture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    group.add(particles);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xaa8800,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const x1 = positions[i * 3], y1 = positions[i * 3 + 1], z1 = positions[i * 3 + 2];
        const x2 = positions[j * 3], y2 = positions[j * 3 + 1], z2 = positions[j * 3 + 2];

        const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);

        if (distance < 120) {
          linePositions.push(x1, y1, z1, x2, y2, z2);
        }
      }
    }
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    group.add(lines);

    // ---- 3. MOUSE INTERACTION ----
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Variables for continuous, smooth coin-spin rotation
    let currentLogoRotationY = 0;
    let logoSpinVelocity = 0;
    let lastMouseX = 0;

    const handleMouseMove = (event) => {
      // Normalize mouse coordinates (-1 to +1)
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

      // Calculate how fast the mouse moved horizontally since the last event
      const mouseDeltaX = mouseX - lastMouseX;
      lastMouseX = mouseX;

      // Calculate the distance of the mouse from the center of the screen
      // mouseX and mouseY are already -1 to +1, so distance from center (0,0) is max ~1.4
      const distanceFromCenter = Math.sqrt(mouseX * mouseX + mouseY * mouseY);

      // Only add spin velocity if the mouse is close to the center (over the logo)
      // 0.4 means the inner 40% of the screen. Increase to 0.6 if the logo is wider.
      if (distanceFromCenter < 0.4) {
        logoSpinVelocity += mouseDeltaX * 30;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // ---- 4. RENDER LOOP ----
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // Background particle interactions
      targetX = mouseX * 1.2;
      targetY = mouseY * 1.2;

      group.rotation.x += 0.05 * (targetY - group.rotation.x);
      group.rotation.y += 0.05 * (targetX - group.rotation.y);

      group.rotation.y += 0.003;
      group.rotation.z += 0.001;

      // --- COIN SPIN LOGIC ---
      if (logoRef.current) {
        // Add current velocity to the total rotation
        currentLogoRotationY += logoSpinVelocity;

        // Apply friction so it gradually slows down to a stop (change 0.95 to 0.99 for longer spin)
        logoSpinVelocity *= 0.95;

        // Apply ONLY Y-axis rotation (perspective is already on the parent container)
        logoRef.current.style.transform = `rotateY(${currentLogoRotationY}deg)`;
      }

      // Floating wave motion for lines and points
      const positionsAttr = geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        positionsAttr.array[i * 3 + 1] = originalY[i] + Math.sin(time * 1.5 + i) * 15;
      }
      positionsAttr.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // ---- 5. CLEANUP ----
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }

      geometry.dispose();
      lineGeometry.dispose();
      particleMaterial.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []); // <-- This closing bracket for useEffect was missing!

  return (
    <div className="relative w-screen min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-[#2a1e00] font-sans overflow-y-auto overflow-x-hidden">

      <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" />

      <div className="relative z-10 w-full selection:bg-yellow-500/30">
        <Navbar />

        <section className="flex flex-col justify-center items-center w-full min-h-screen px-4 pb-10">
          <div className="relative z-20 flex justify-center items-center w-full pt-12 md:pt-16" style={{ perspective: '1000px' }}>
            <img
              ref={logoRef}
              src={logo}
              alt="Guardians Logo"
              className="w-[800px] max-w-[80vw] h-auto object-contain drop-shadow-[0_0_40px_rgba(218,165,32,0.4)] animate-pulse-slow"
            />
          </div>

          <div className="mt-0 pointer-events-auto z-20 text-center w-full">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-b from-white via-[rgb(212,176,91)] to-[rgba(212,176,91,0.6)] drop-shadow-[0_10px_20px_rgba(212,176,91,0.3)] mx-auto pl-[0.25em]">Guardians</h1>
            <div className="flex w-full justify-center mt-6"><div className="w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[rgb(212,176,91)] to-transparent opacity-80" /></div>
          </div>
        </section>

        <section className="w-full min-h-screen flex flex-col items-center justify-center px-4 md:px-10 py-16 gap-6">
          <h2 className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-b from-white via-[rgb(212,176,91)] to-[rgba(212,176,91,0.6)] drop-shadow-[0_10px_20px_rgba(212,176,91,0.3)] text-center ">
            Overall Standings
          </h2>
          <div className="w-56 h-[1px] bg-gradient-to-r from-transparent via-[rgb(212,176,91)] to-transparent opacity-70 mb-8" />

          <div
            className="w-full max-w-[1400px] rounded-2xl overflow-hidden"
            style={{
              minHeight: 'calc(75vh - 220px)',
              background: 'linear-gradient(140deg, rgba(20,20,20,0.82), rgba(8,8,8,0.88))',
              border: '1px solid rgba(212,176,91,0.22)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ width: '100%', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212,176,91,0.2)' }}>
                    {['Rank', 'House', 'Arts', 'Sports', 'Total'].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: '16px 20px',
                          textAlign: i === 0 ? 'center' : i >= 2 ? 'center' : 'left',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'rgba(212,176,91,0.7)',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedHouses.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <Loader text="Loading Standings" />
                      </td>
                    </tr>
                  )}
                  {sortedHouses.map((h, idx) => {
                    const rankColor = RANK_COLOR[idx] || 'rgba(255,255,255,0.55)';
                    const houseColor = getHouseColor(h.houseName);
                    const isTop = idx === 0;
                    const rankMeta = idx === 0
                      ? { symbol: '1', bg: 'linear-gradient(145deg, rgba(255,215,0,0.35), rgba(212,176,91,0.14))', border: '1px solid rgba(255,215,0,0.8)' }
                      : idx === 1
                        ? { symbol: '2', bg: 'linear-gradient(145deg, rgba(210,210,220,0.35), rgba(170,170,185,0.14))', border: '1px solid rgba(220,220,235,0.8)' }
                        : idx === 2
                          ? { symbol: '3', bg: 'linear-gradient(145deg, rgba(205,127,50,0.35), rgba(162,93,28,0.14))', border: '1px solid rgba(205,127,50,0.85)' }
                          : null;
                    return (
                      <tr
                        key={h.houseId}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: isTop ? 'rgba(212,176,91,0.04)' : 'transparent',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,176,91,0.07)'}
                        onMouseLeave={e => e.currentTarget.style.background = isTop ? 'rgba(212,176,91,0.04)' : 'transparent'}
                      >
                        <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                          {rankMeta ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: rankMeta.bg,
                                border: rankMeta.border,
                                boxShadow: '0 0 18px rgba(212,176,91,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                                color: 'rgba(255,245,215,0.98)',
                                fontWeight: 900,
                                fontSize: '0.9rem',
                                lineHeight: 1,
                              }}
                              aria-label={`Rank ${idx + 1}`}
                            >
                              {rankMeta.symbol}
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              border: `1px solid ${rankColor}`,
                              color: rankColor,
                              fontWeight: 800,
                              fontSize: '0.82rem',
                            }}>
                              {idx + 1}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '18px 20px' }}>
                          <span style={{
                            fontWeight: 800,
                            fontSize: '1.0rem',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: houseColor !== 'var(--text-light)' ? houseColor : 'rgb(212,176,91)',
                            filter: 'brightness(2.2)',
                          }}>
                            {h.houseName}
                          </span>
                        </td>
                        <td style={{ padding: '18px 20px', textAlign: 'center', color: 'rgb(212,176,91)', fontWeight: 700, fontSize: '1rem' }}>
                          {h.artsPoints ?? 0}
                        </td>
                        <td style={{ padding: '18px 20px', textAlign: 'center', color: 'rgb(212,176,91)', fontWeight: 700, fontSize: '1rem' }}>
                          {h.sportsPoints ?? 0}
                        </td>
                        <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                          <span style={{ fontWeight: 900, fontSize: '1.15rem', color: 'rgb(212,176,91)' }}>
                            {h.totalPoints ?? 0}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}











