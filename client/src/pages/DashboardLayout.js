import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const styles = `
  .dashboard-root { display:flex; min-height:100vh; background:#0a0a0f; font-family:'DM Sans',sans-serif; }
  
  .sidebar {
    width:240px; flex-shrink:0; background:#111118; border-right:1px solid rgba(255,255,255,0.05);
    display:flex; flex-direction:column; padding:1.5rem 0; position:fixed; top:0; left:0; bottom:0; z-index:50;
    overflow-y:auto;
  }
  .sidebar-logo { padding:0 1.5rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:1rem; }
  .sidebar-logo-text { font-family:'Syne',sans-serif; font-size:1.2rem; font-weight:800; color:#f0f0ff; }
  .sidebar-logo-text span { color:#ff6b35; }
  .sidebar-logo-sub { font-size:0.73rem; color:#5a5a72; margin-top:0.1rem; }

  .sidebar-section { padding:0 0.75rem; margin-bottom:0.5rem; }
  .sidebar-section-label { font-size:0.68rem; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:#5a5a72; padding:0.6rem 0.75rem; }

  .sidebar-link {
    display:flex; align-items:center; gap:0.75rem; padding:0.65rem 0.75rem; border-radius:10px;
    font-size:0.88rem; font-weight:500; color:#9898b0; text-decoration:none;
    transition:all 0.15s; margin-bottom:2px; cursor:pointer; border:none; background:none; width:100%;
  }
  .sidebar-link:hover { background:rgba(255,255,255,0.04); color:#f0f0ff; }
  .sidebar-link.active { background:rgba(255,107,53,0.1); color:#ff6b35; }
  .sidebar-link-icon { font-size:1rem; width:20px; text-align:center; flex-shrink:0; }
  .sidebar-link-badge {
    margin-left:auto; background:rgba(255,107,53,0.15); color:#ff6b35;
    border-radius:50px; padding:0.1rem 0.5rem; font-size:0.68rem; font-weight:700;
    font-family:'JetBrains Mono',monospace;
  }

  .sidebar-bottom { margin-top:auto; padding:0 0.75rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:1rem; }
  .user-card {
    display:flex; align-items:center; gap:0.75rem; padding:0.75rem;
    background:rgba(255,255,255,0.03); border-radius:12px; cursor:pointer;
    transition:background 0.15s;
  }
  .user-card:hover { background:rgba(255,255,255,0.06); }
  .user-avatar {
    width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#ff6b35,#f59e0b);
    display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif;
    font-size:0.9rem; font-weight:800; color:#0a0a0f; flex-shrink:0;
  }
  .user-name { font-size:0.85rem; font-weight:600; color:#f0f0ff; }
  .user-email { font-size:0.72rem; color:#5a5a72; }

  .main-content { margin-left:240px; flex:1; min-height:100vh; display:flex; flex-direction:column; }
  .top-bar {
    position:sticky; top:0; z-index:40; padding:1rem 2rem;
    background:rgba(10,10,15,0.85); backdrop-filter:blur(20px);
    border-bottom:1px solid rgba(255,255,255,0.04);
    display:flex; align-items:center; justify-content:space-between;
  }
  .top-bar-title { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:700; color:#f0f0ff; }
  .top-bar-date { font-size:0.82rem; color:#9898b0; }
  .top-bar-right { display:flex; align-items:center; gap:1rem; }
  .icon-btn {
    width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all 0.15s; font-size:1rem;
  }
  .icon-btn:hover { background:rgba(255,255,255,0.08); }
  .logout-btn {
    padding:0.45rem 1rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2);
    border-radius:8px; color:#ef4444; font-family:'DM Sans',sans-serif; font-size:0.82rem;
    font-weight:600; cursor:pointer; transition:all 0.15s;
  }
  .logout-btn:hover { background:rgba(239,68,68,0.2); }
  .page-content { flex:1; padding:2rem; overflow-y:auto; }

  @media (max-width:900px) {
    .sidebar { width:200px; }
    .main-content { margin-left:200px; }
  }
  @media (max-width:680px) {
    .sidebar { transform:translateX(-100%); }
    .main-content { margin-left:0; }
  }
`;

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard', end: true },
  { to: '/dashboard/habits', icon: '⚡', label: 'Habits' },
  { to: '/dashboard/timetable', icon: '📅', label: 'Timetable' },
  { to: '/dashboard/tasks', icon: '✅', label: 'Tasks' },
  { to: '/dashboard/transformation', icon: '🔥', label: 'Transformation' },
  { to: '/dashboard/stats', icon: '📊', label: 'Analytics' },
  { to: '/dashboard/profile', icon: '👤', label: 'Profile' },
];

export default function DashboardLayout() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleLogout = () => {
    logout();
    toast.success('See you tomorrow! 👋');
    navigate('/login');
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U';

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-root">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-text">🔥 <span>Habit</span>Forge</div>
            <div className="sidebar-logo-sub">Build discipline daily</div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-label">Main</div>
            {navItems.slice(0, 5).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-label">Insights</div>
            {navItems.slice(5).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="sidebar-bottom">
            <div className="user-card" onClick={() => navigate('/dashboard/profile')}>
              <div className="user-avatar">{initials}</div>
              <div>
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-email">{user?.email?.split('@')[0] || ''}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="main-content">
          <div className="top-bar">
            <div>
              <div className="top-bar-title">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋</div>
              <div className="top-bar-date">{today}</div>
            </div>
            <div className="top-bar-right">
  <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
    {theme === 'dark' ? '☀️' : '🌙'}
  </button>
  <button className="logout-btn" onClick={handleLogout}>Sign out</button>
</div>
          </div>
          <div className="page-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
