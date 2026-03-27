import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';

const styles = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .stats-page { display:flex; flex-direction:column; gap:1.5rem; }
  .page-title { font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:800; color:#f0f0ff; }
  .page-sub { font-size:0.85rem; color:#9898b0; margin-top:0.2rem; }
  .stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.25rem; }
  .chart-card { background:#16161f; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:1.5rem; animation:fadeInUp 0.4s ease; }
  .chart-card.wide { grid-column:span 2; }
  .card-title { font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; color:#f0f0ff; margin-bottom:1.25rem; }
  .card-subtitle { font-size:0.78rem; color:#9898b0; margin-top:-0.75rem; margin-bottom:1rem; }
  .stat-highlight { font-family:'Syne',sans-serif; font-size:2.5rem; font-weight:800; line-height:1; }
  .stat-detail { font-size:0.8rem; color:#9898b0; margin-top:0.3rem; }
  .metric-row { display:flex; justify-content:space-between; margin-bottom:0.75rem; }
  .metric-label { font-size:0.82rem; color:#9898b0; }
  .metric-val { font-family:'Syne',sans-serif; font-size:0.88rem; font-weight:700; color:#f0f0ff; }
  .habit-perf-item { display:flex; align-items:center; gap:0.85rem; padding:0.75rem 0; border-bottom:1px solid rgba(255,255,255,0.04); }
  .habit-perf-item:last-child { border-bottom:none; }
  .habit-perf-name { flex:1; font-size:0.85rem; color:#f0f0ff; }
  .habit-perf-bar-wrap { width:100px; height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
  .habit-perf-bar { height:100%; border-radius:3px; }
  .habit-perf-pct { font-family:'JetBrains Mono',monospace; font-size:0.72rem; color:#9898b0; width:36px; text-align:right; }
  @media (max-width:900px) { .chart-card.wide{grid-column:span 1} }
`;

const CAT_COLORS = ['#ff6b35','#8b5cf6','#06b6d4','#10b981','#ec4899','#f59e0b','#ef4444','#3b82f6'];
const CHART_TOOLTIP_STYLE = { background:'#1e1e2e', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', fontFamily:'DM Sans', fontSize:'0.82rem' };

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    api.get('/stats/dashboard').then(r => setStats(r.data));
    api.get('/habits').then(r => setHabits(r.data));
  }, []);

  if (!stats) return <div style={{color:'#9898b0',padding:'2rem',textAlign:'center'}}>Loading analytics...</div>;

  // Category distribution
  const catData = habits.reduce((acc, h) => {
    const existing = acc.find(a => a.name === h.category);
    if (existing) existing.value++;
    else acc.push({ name: h.category || 'other', value: 1 });
    return acc;
  }, []);

  // Habit performance
  const habitPerf = habits.map(h => {
    const days = Math.max(Math.ceil((new Date() - new Date(h.createdAt)) / 86400000), 1);
    const rate = Math.min(100, Math.round((h.totalCompleted / days) * 100));
    return { name: h.icon + ' ' + h.name, rate, streak: h.streak, color: h.color || '#ff6b35' };
  }).sort((a,b) => b.rate - a.rate);

  // Radar data for categories
  const radarData = ['health','fitness','mindfulness','learning','productivity','creative'].map(cat => ({
    category: cat.slice(0,6),
    value: habits.filter(h=>h.category===cat).reduce((s,h)=>s+h.streak,0)
  }));

  return (
    <>
      <style>{styles}</style>
      <div className="stats-page">
        <div>
          <div className="page-title">📊 Analytics</div>
          <div className="page-sub">Your discipline, visualized</div>
        </div>

        <div className="stats-grid">
          {/* Weekly chart */}
          <div className="chart-card wide">
            <div className="card-title">Weekly Habit Completion</div>
            <div className="card-subtitle">Last 7 days</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.weeklyData}>
                <defs>
                  <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff6b35" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fill:'#5a5a72',fontSize:11}} tickFormatter={d=>new Date(d).toLocaleDateString('en',{weekday:'short'})} />
                <YAxis tick={{fill:'#5a5a72',fontSize:11}} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{color:'#9898b0'}} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#ff6b35" strokeWidth={2} fill="url(#ag1)" />
                <Area type="monotone" dataKey="total" name="Total" stroke="#8b5cf6" strokeWidth={2} fill="url(#ag2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Key metrics */}
          <div className="chart-card">
            <div className="card-title">Key Metrics</div>
            {[
              { label:'Total Habits', val: stats.totalHabits },
              { label:'Completed Today', val: `${stats.completedToday}/${stats.totalHabits}` },
              { label:'Avg Streak', val: `${stats.avgStreak} days` },
              { label:'Longest Streak', val: `${stats.longestStreak} days` },
              { label:'Tasks Today', val: `${stats.todayTasksCompleted}/${stats.todayTasksTotal}` },
            ].map((m,i) => (
              <div key={i} className="metric-row">
                <span className="metric-label">{m.label}</span>
                <span className="metric-val">{m.val}</span>
              </div>
            ))}
          </div>

          {/* Category pie */}
          <div className="chart-card">
            <div className="card-title">Habits by Category</div>
            {catData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      dataKey="value" nameKey="name">
                      {catData.map((_,i) => <Cell key={i} fill={CAT_COLORS[i%CAT_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem',marginTop:'0.5rem'}}>
                  {catData.map((c,i)=>(
                    <span key={i} style={{fontSize:'0.72rem',padding:'0.15rem 0.5rem',borderRadius:'50px',background:`${CAT_COLORS[i%8]}15`,color:CAT_COLORS[i%8]}}>{c.name} ({c.value})</span>
                  ))}
                </div>
              </>
            ) : <div style={{textAlign:'center',padding:'2rem',color:'#5a5a72'}}>No habits yet</div>}
          </div>

          {/* Habit performance */}
          <div className="chart-card wide">
            <div className="card-title">Habit Performance</div>
            <div className="card-subtitle">Completion rate since creation</div>
            {habitPerf.length > 0 ? habitPerf.map((h,i) => (
              <div key={i} className="habit-perf-item">
                <div className="habit-perf-name">{h.name}</div>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexShrink:0}}>
                  <span style={{fontSize:'0.72rem',color:'#f59e0b'}}>🔥{h.streak}</span>
                  <div className="habit-perf-bar-wrap">
                    <div className="habit-perf-bar" style={{width:`${h.rate}%`,background:h.color}} />
                  </div>
                  <span className="habit-perf-pct">{h.rate}%</span>
                </div>
              </div>
            )) : <div style={{textAlign:'center',padding:'2rem',color:'#5a5a72'}}>Add habits to see performance</div>}
          </div>

          {/* Bar chart */}
          <div className="chart-card">
            <div className="card-title">Streak Distribution</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={habitPerf.slice(0,6).map(h=>({name:h.name.slice(0,8),streak:h.streak,rate:h.rate}))}>
                <XAxis dataKey="name" tick={{fill:'#5a5a72',fontSize:10}} />
                <YAxis tick={{fill:'#5a5a72',fontSize:11}} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="streak" name="Streak" fill="#ff6b35" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar */}
          <div className="chart-card">
            <div className="card-title">Category Radar</div>
            <div className="card-subtitle">Total streak points by category</div>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="category" tick={{fill:'#9898b0',fontSize:11}} />
                <Radar name="Streak" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
