import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

// We'll use inline styles since styled-components might not be installed
// Using pure CSS-in-JS approach

const floatUp = `
  @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
`;

const styles = `
  ${floatUp}
  .landing-body { background: #0a0a0f; min-height: 100vh; overflow-x: hidden; }
  .hero-bg {
    position: fixed; inset: 0; z-index: 0;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.25) 0%, transparent 60%),
                radial-gradient(ellipse 40% 40% at 80% 80%, rgba(255,107,53,0.12) 0%, transparent 50%),
                radial-gradient(ellipse 50% 50% at 10% 70%, rgba(6,182,212,0.08) 0%, transparent 50%);
  }
  .noise-overlay {
    position: fixed; inset: 0; z-index: 1; opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 4rem;
    background: rgba(10,10,15,0.7);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .nav-logo {
    display: flex; align-items: center; gap: 0.6rem;
    font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 800;
    color: #f0f0ff;
  }
  .nav-logo span { color: #ff6b35; }
  .nav-links { display: flex; align-items: center; gap: 2rem; }
  .nav-link {
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    color: #9898b0; cursor: pointer; transition: color 0.2s;
    background: none; border: none; padding: 0;
  }
  .nav-link:hover { color: #f0f0ff; }
  .nav-cta {
    background: linear-gradient(135deg, #ff6b35, #f59e0b);
    color: #0a0a0f; border: none; border-radius: 50px;
    padding: 0.6rem 1.5rem;
    font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700;
    cursor: pointer; transition: opacity 0.2s, transform 0.2s;
  }
  .nav-cta:hover { opacity: 0.9; transform: translateY(-1px); }

  .hero {
    position: relative; z-index: 2;
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 8rem 2rem 4rem;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.3);
    border-radius: 50px; padding: 0.4rem 1rem;
    font-family: 'DM Sans', sans-serif; font-size: 0.82rem; color: #ff6b35;
    margin-bottom: 2rem;
    animation: fadeInUp 0.6s ease both;
  }
  .hero-title {
    font-family: 'Syne', sans-serif; font-size: clamp(2.8rem, 7vw, 5.5rem);
    font-weight: 800; line-height: 1.05; letter-spacing: -0.03em;
    color: #f0f0ff; margin-bottom: 1.5rem; max-width: 850px;
    animation: fadeInUp 0.6s ease 0.1s both;
  }
  .hero-title .gradient-text {
    background: linear-gradient(135deg, #ff6b35 0%, #f59e0b 40%, #8b5cf6 100%);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 4s ease infinite;
  }
  .hero-subtitle {
    font-family: 'DM Sans', sans-serif; font-size: clamp(1rem, 2vw, 1.2rem);
    color: #9898b0; max-width: 560px; line-height: 1.7;
    margin-bottom: 3rem;
    animation: fadeInUp 0.6s ease 0.2s both;
  }
  .hero-ctas {
    display: flex; align-items: center; gap: 1rem;
    flex-wrap: wrap; justify-content: center;
    animation: fadeInUp 0.6s ease 0.3s both;
  }
  .btn-primary {
    background: linear-gradient(135deg, #ff6b35, #f59e0b);
    color: #0a0a0f; border: none; border-radius: 50px;
    padding: 0.9rem 2.4rem;
    font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 8px 30px rgba(255,107,53,0.35);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(255,107,53,0.5); }
  .btn-secondary {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
    color: #f0f0ff; border-radius: 50px;
    padding: 0.9rem 2.4rem;
    font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); }

  .hero-stats {
    display: flex; align-items: center; gap: 3rem;
    margin-top: 4rem; padding-top: 3rem;
    border-top: 1px solid rgba(255,255,255,0.06);
    animation: fadeInUp 0.6s ease 0.4s both;
  }
  .hero-stat { text-align: center; }
  .hero-stat-number {
    font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800;
    background: linear-gradient(135deg, #f0f0ff, #9898b0);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .hero-stat-label { font-size: 0.8rem; color: #5a5a72; margin-top: 0.2rem; font-family: 'DM Sans', sans-serif; }

  /* Features */
  .section { position: relative; z-index: 2; padding: 6rem 2rem; max-width: 1200px; margin: 0 auto; }
  .section-tag {
    display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
    color: #8b5cf6; text-transform: uppercase; letter-spacing: 0.15em;
    margin-bottom: 1rem;
  }
  .section-title {
    font-family: 'Syne', sans-serif; font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800; color: #f0f0ff; margin-bottom: 1rem;
    line-height: 1.1;
  }
  .section-sub { font-family: 'DM Sans', sans-serif; color: #9898b0; font-size: 1.05rem; max-width: 480px; line-height: 1.7; }

  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 4rem; }
  .feature-card {
    background: #16161f; border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px; padding: 2rem;
    transition: all 0.3s ease; cursor: default;
    position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: ''; position: absolute; inset: 0; border-radius: 20px;
    background: linear-gradient(135deg, var(--accent-color, #8b5cf6), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .feature-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.1); }
  .feature-card:hover::before { opacity: 0.05; }
  .feature-icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; margin-bottom: 1.2rem;
    background: var(--icon-bg, rgba(139,92,246,0.15));
  }
  .feature-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; color: #f0f0ff; margin-bottom: 0.5rem; }
  .feature-desc { font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: #9898b0; line-height: 1.6; }

  /* Transformation section */
  .transform-section {
    position: relative; z-index: 2; padding: 6rem 2rem;
    background: linear-gradient(180deg, transparent, rgba(139,92,246,0.03), transparent);
  }
  .transform-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
  .transform-cards { display: flex; flex-direction: column; gap: 1rem; }
  .transform-card {
    background: #16161f; border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px; padding: 1.25rem 1.5rem;
    display: flex; align-items: center; gap: 1.2rem;
    transition: all 0.2s;
  }
  .transform-card:hover { border-color: rgba(255,255,255,0.1); transform: translateX(4px); }
  .transform-card-icon { font-size: 1.8rem; flex-shrink: 0; }
  .transform-card-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #f0f0ff; }
  .transform-card-sub { font-family: 'DM Sans', sans-serif; font-size: 0.82rem; color: #9898b0; }
  .progress-bar-outer { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; margin-top: 0.6rem; }
  .progress-bar-inner { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #ff6b35, #f59e0b); }

  /* CTA section */
  .cta-section {
    position: relative; z-index: 2; text-align: center; padding: 8rem 2rem;
  }
  .cta-glow {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 600px; height: 300px;
    background: radial-gradient(ellipse, rgba(255,107,53,0.15), transparent 70%);
    pointer-events: none;
  }
  .cta-card {
    position: relative; max-width: 700px; margin: 0 auto;
    background: #16161f; border: 1px solid rgba(255,107,53,0.2);
    border-radius: 32px; padding: 4rem;
    overflow: hidden;
  }
  .cta-card::before {
    content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 200px; height: 2px;
    background: linear-gradient(90deg, transparent, #ff6b35, transparent);
  }

  /* Footer */
  .footer {
    position: relative; z-index: 2; border-top: 1px solid rgba(255,255,255,0.05);
    padding: 2.5rem 4rem; display: flex; align-items: center; justify-content: space-between;
  }
  .footer-logo { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #f0f0ff; }
  .footer-logo span { color: #ff6b35; }
  .footer-text { font-family: 'DM Sans', sans-serif; font-size: 0.82rem; color: #5a5a72; }

  @media (max-width: 768px) {
    .nav { padding: 1rem 1.5rem; }
    .nav-links { display: none; }
    .hero-stats { gap: 1.5rem; }
    .transform-inner { grid-template-columns: 1fr; gap: 2rem; }
    .footer { flex-direction: column; gap: 1rem; text-align: center; padding: 2rem; }
  }
`;

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: '⚡', title: 'Smart Habit Tracking', desc: 'Build powerful daily habits with streak tracking, completion rates, and intelligent reminders.', bg: 'rgba(255,107,53,0.12)', color: '#ff6b35' },
    { icon: '📅', title: 'Daily Timetable', desc: 'Structure your day with a beautiful time-block schedule. Check off tasks and monitor your monthly compliance rate.', bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
    { icon: '✅', title: 'Task Management', desc: 'Capture every to-do with priorities, deadlines, subtasks, and smart categorization.', bg: 'rgba(6,182,212,0.12)', color: '#06b6d4' },
    { icon: '🔥', title: 'Transformation Challenges', desc: 'Commit to 30, 75, or 100-day challenges. Track daily progress with mood logs and milestone celebrations.', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    { icon: '📊', title: 'Deep Analytics', desc: 'Visual heatmaps, streak charts, and completion analytics give you a full picture of your discipline.', bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    { icon: '🎯', title: 'Monthly Targets', desc: 'Set monthly streak goals and receive live progress indicators to keep you locked in on your targets.', bg: 'rgba(236,72,153,0.12)', color: '#ec4899' },
  ];

  const transformations = [
    { icon: '💪', title: '75 Hard Challenge', sub: 'The ultimate discipline test', progress: 68 },
    { icon: '📚', title: '100 Days of Learning', sub: 'Build knowledge daily', progress: 42 },
    { icon: '🧘', title: '30 Days Mindfulness', sub: 'Inner peace journey', progress: 87 },
    { icon: '🏃', title: '21-Day Fitness Reset', sub: 'Transform your body', progress: 33 },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="landing-body">
        <div className="hero-bg" />
        <div className="noise-overlay" />

        {/* Nav */}
        <nav className="nav">
          <div className="nav-logo">🔥 <span>Habit</span>Forge</div>
          <div className="nav-links">
            <button className="nav-link">Features</button>
            <button className="nav-link">Challenges</button>
            <button className="nav-link">Analytics</button>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button className="nav-link" onClick={() => navigate('/login')}>Sign in</button>
            <button className="nav-cta" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">✦ Your discipline, visualized</div>
          <h1 className="hero-title">
            The app that turns<br />
            <span className="gradient-text">consistency into identity</span>
          </h1>
          <p className="hero-subtitle">
            Track habits, manage your daily schedule, crush transformation challenges, 
            and watch your streaks compound into extraordinary results.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => navigate('/register')}>
              Start for free →
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">21+</div>
              <div className="hero-stat-label">Days to form a habit</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.08)' }} />
            <div className="hero-stat">
              <div className="hero-stat-number">100</div>
              <div className="hero-stat-label">Day transformation</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.08)' }} />
            <div className="hero-stat">
              <div className="hero-stat-number">∞</div>
              <div className="hero-stat-label">Your potential</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <div className="section">
          <p className="section-tag">// FEATURES</p>
          <h2 className="section-title">Everything you need<br />to build discipline</h2>
          <p className="section-sub">One powerful platform to track habits, schedule your day, and complete transformation challenges.</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{ '--accent-color': f.color, '--icon-bg': f.bg }}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Transformation */}
        <div className="transform-section">
          <div className="transform-inner">
            <div>
              <p className="section-tag">// TRANSFORMATION</p>
              <h2 className="section-title">Commit to challenges.<br />Become unstoppable.</h2>
              <p className="section-sub" style={{ marginBottom: '2rem' }}>
                Join the 30, 75, or 100-day challenges. Every day you show up gets logged, 
                celebrated, and reflected back to you as proof of your character.
              </p>
              <button className="btn-primary" onClick={() => navigate('/register')}>
                Start a challenge →
              </button>
            </div>
            <div className="transform-cards">
              {transformations.map((t, i) => (
                <div key={i} className="transform-card">
                  <div className="transform-card-icon">{t.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div className="transform-card-title">{t.title}</div>
                    <div className="transform-card-sub">{t.sub}</div>
                    <div className="progress-bar-outer">
                      <div className="progress-bar-inner" style={{ width: `${t.progress}%` }} />
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#ff6b35', marginTop: '0.3rem' }}>{t.progress}% complete</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="cta-section">
          <div className="cta-glow" />
          <div className="cta-card">
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem', animation: 'floatUp 3s ease infinite' }}>🔥</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: '#f0f0ff', marginBottom: '1rem', lineHeight: 1.1 }}>
              Ready to forge<br />your habits?
            </h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#9898b0', marginBottom: '2.5rem', lineHeight: 1.7 }}>
              Join thousands of people who use HabitForge<br />to track, build, and transform their daily lives.
            </p>
            <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '1rem 3rem' }} onClick={() => navigate('/register')}>
              Create free account →
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-logo">🔥 <span>Habit</span>Forge</div>
          <div className="footer-text">Build discipline. Stay consistent. Become legendary.</div>
          <div className="footer-text">© 2025 HabitForge</div>
        </footer>
      </div>
    </>
  );
}
