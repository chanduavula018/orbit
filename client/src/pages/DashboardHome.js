import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const styles = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes countUp { from{opacity:0} to{opacity:1} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }

  .db-grid { display:grid; gap:1.5rem; }
  .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1.25rem; animation:fadeInUp 0.4s ease; }
  .stat-card {
    background:#16161f; border:1px solid rgba(255,255,255,0.06); border-radius:16px;
    padding:1.5rem; position:relative; overflow:hidden; cursor:pointer;
    transition:transform 0.2s,border-color 0.2s;
  }
  .stat-card:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.1); }
  .stat-card-glow {
    position:absolute; top:-30px; right:-30px; width:100px; height:100px;
    border-radius:50%; opacity:0.15; filter:blur(30px);
  }
  .stat-label { font-size:0.78rem; color:#9898b0; font-weight:500; margin-bottom:0.75rem; text-transform:uppercase; letter-spacing:0.05em; }
  .stat-value { font-family:'Syne',sans-serif; font-size:2.2rem; font-weight:800; color:#f0f0ff; line-height:1; }
  .stat-sub { font-size:0.78rem; color:#5a5a72; margin-top:0.4rem; }
  .stat-icon { position:absolute; top:1.25rem; right:1.25rem; font-size:1.4rem; }

  .row-2 { display:grid; grid-template-columns:2fr 1fr; gap:1.25rem; animation:fadeInUp 0.4s ease 0.1s both; }
  .card { background:#16161f; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:1.5rem; }
  .card-title { font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; color:#f0f0ff; margin-bottom:1.25rem; display:flex; align-items:center; justify-content:space-between; }
  .card-title-action { font-family:'DM Sans',sans-serif; font-size:0.78rem; font-weight:500; color:#ff6b35; cursor:pointer; }

  .row-3 { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; animation:fadeInUp 0.4s ease 0.2s both; }

  /* Habit list */
  .habit-item { display:flex; align-items:center; gap:0.85rem; padding:0.75rem 0; border-bottom:1px solid rgba(255,255,255,0.04); }
  .habit-item:last-child { border-bottom:none; }
  .habit-check {
    width:26px; height:26px; border-radius:50%; border:2px solid; display:flex; align-items:center; justify-content:center;
    flex-shrink:0; cursor:pointer; transition:all 0.2s; font-size:0.7rem;
  }
  .habit-check.done { background:var(--c); border-color:var(--c); color:#0a0a0f; }
  .habit-check.undone { background:transparent; }
  .habit-name { flex:1; font-size:0.88rem; font-weight:500; color:#f0f0ff; }
  .habit-streak { font-family:'JetBrains Mono',monospace; font-size:0.72rem; color:#ff6b35; background:rgba(255,107,53,0.1); padding:0.15rem 0.5rem; border-radius:50px; }

  /* Transformation progress */
  .transform-progress-card {
    background:linear-gradient(135deg,rgba(255,107,53,0.08),rgba(245,158,11,0.05));
    border:1px solid rgba(255,107,53,0.15); border-radius:16px; padding:1.5rem;
  }
  .transform-title { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:700; color:#f0f0ff; margin-bottom:0.4rem; }
  .transform-sub { font-size:0.82rem; color:#9898b0; margin-bottom:1.25rem; }
  .big-progress { position:relative; height:10px; background:rgba(255,255,255,0.06); border-radius:5px; overflow:hidden; }
  .big-progress-fill { height:100%; background:linear-gradient(90deg,#ff6b35,#f59e0b); border-radius:5px; transition:width 1s ease; }
  .day-grid { display:grid; grid-template-columns:repeat(10,1fr); gap:4px; margin-top:1.25rem; }
  .day-dot { height:22px; border-radius:4px; background:rgba(255,255,255,0.05); transition:background 0.2s; }
  .day-dot.done { background:linear-gradient(135deg,#ff6b35,#f59e0b); }
  .day-dot.today { background:rgba(255,107,53,0.35); border:1px solid #ff6b35; }

  /* Weekly chart */
  .chart-tooltip { background:#1e1e2e!important; border:1px solid rgba(255,255,255,0.1)!important; border-radius:10px!important; font-family:'DM Sans',sans-serif!important; }

  /* Quick actions */
  .quick-actions { display:grid; grid-template-columns:repeat(2,1fr); gap:0.75rem; }
  .qa-btn {
    padding:1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
    border-radius:12px; display:flex; align-items:center; gap:0.75rem;
    cursor:pointer; transition:all 0.2s; text-align:left;
  }
  .qa-btn:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.1); transform:translateY(-2px); }
  .qa-icon { font-size:1.4rem; }
  .qa-label { font-size:0.82rem; font-weight:600; color:#f0f0ff; font-family:'DM Sans',sans-serif; }
  .qa-sub { font-size:0.72rem; color:#5a5a72; }

  /* Streak heatmap */
  .heatmap-row { display:flex; gap:3px; margin-bottom:3px; }
  .heatmap-cell { width:14px; height:14px; border-radius:3px; background:rgba(255,255,255,0.04); }
  .heatmap-cell.l1 { background:rgba(255,107,53,0.2); }
  .heatmap-cell.l2 { background:rgba(255,107,53,0.4); }
  .heatmap-cell.l3 { background:rgba(255,107,53,0.65); }
  .heatmap-cell.l4 { background:#ff6b35; }

  .empty-state { text-align:center; padding:2rem; color:#5a5a72; font-size:0.88rem; }
  .empty-icon { font-size:2rem; margin-bottom:0.5rem; }

  @media (max-width:1100px) { .stats-row{grid-template-columns:repeat(2,1fr)} .row-2{grid-template-columns:1fr} }
  @media (max-width:700px) { .stats-row{grid-template-columns:1fr} .row-3{grid-template-columns:1fr} }
`;

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      api.get('/stats/dashboard'),
      api.get('/habits')
    ]).then(([s, h]) => {
      setStats(s.data);
      setHabits(h.data.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  const toggleHabit = async (id) => {
    try {
      const res = await api.post(`/habits/${id}/toggle`, { date: today });
      setHabits(prev => prev.map(h => h._id === id ? res.data : h));
      const sr = await api.get('/stats/dashboard');
      setStats(sr.data);
    } catch (e) {}
  };

  const isCompleted = (habit) => habit.completions?.find(c => c.date === today)?.completed;

  const colors = ['#ff6b35','#8b5cf6','#06b6d4','#10b981','#ec4899','#f59e0b'];

  // Generate heatmap data (last 12 weeks)
  const heatmapData = [];
  for (let w = 11; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(); date.setDate(date.getDate() - (w * 7 + d));
      const dateStr = date.toISOString().split('T')[0];
      const completedCount = habits.filter(h => h.completions?.find(c => c.date === dateStr && c.completed)).length;
      const total = habits.length || 1;
      const ratio = completedCount / total;
      week.push({ ratio, dateStr });
    }
    heatmapData.push(week);
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <div style={{ textAlign:'center', color:'#9898b0' }}>
        <div style={{ fontSize:'2rem', marginBottom:'0.5rem', animation:'pulse 1s infinite' }}>⚡</div>
        <div>Loading your data...</div>
      </div>
    </div>
  );

  const transform = stats?.activeTransformation;

  return (
    <>
      <style>{styles}</style>
      <div className="db-grid">
        {/* Stats Row */}
        <div className="stats-row">
          {[
            { label: 'Habits Today', value: `${stats?.completedToday || 0}/${stats?.totalHabits || 0}`, sub: 'completed', icon: '⚡', color: '#ff6b35' },
            { label: 'Current Streak', value: `${stats?.avgStreak || 0}`, sub: 'day avg streak', icon: '🔥', color: '#f59e0b' },
            { label: 'Longest Streak', value: `${stats?.longestStreak || 0}`, sub: 'days', icon: '🏆', color: '#8b5cf6' },
            { label: 'Tasks Today', value: `${stats?.todayTasksCompleted || 0}/${stats?.todayTasksTotal || 0}`, sub: 'done', icon: '✅', color: '#10b981' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-glow" style={{ background: s.color }} />
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
              <div className="stat-icon">{s.icon}</div>
            </div>
          ))}
        </div>

        {/* Row 2: Chart + Quick Actions */}
        <div className="row-2">
          <div className="card">
            <div className="card-title">
              Weekly Completion
              <span className="card-title-action" onClick={() => navigate('/dashboard/stats')}>View analytics →</span>
            </div>
            {stats?.weeklyData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={stats.weeklyData}>
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: '#5a5a72', fontSize: 11, fontFamily: 'DM Sans' }}
                    tickFormatter={d => new Date(d).toLocaleDateString('en',{weekday:'short'})} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background:'#1e1e2e', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', fontFamily:'DM Sans' }}
                    labelStyle={{ color:'#9898b0', fontSize:'0.78rem' }} itemStyle={{ color:'#ff6b35' }} />
                  <Area type="monotone" dataKey="completed" stroke="#ff6b35" strokeWidth={2} fill="url(#cg)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><div className="empty-icon">📊</div>Add habits to see your chart</div>}
          </div>

          <div className="card">
            <div className="card-title">Quick Actions</div>
            <div className="quick-actions">
              {[
                { icon:'⚡', label:'Add Habit', sub:'New routine', path:'/dashboard/habits' },
                { icon:'✅', label:'Add Task', sub:'Today\'s todo', path:'/dashboard/tasks' },
                { icon:'📅', label:'Schedule', sub:'Plan your day', path:'/dashboard/timetable' },
                { icon:'🔥', label:'Challenge', sub:'Start 100 days', path:'/dashboard/transformation' },
              ].map((q,i) => (
                <button key={i} className="qa-btn" onClick={() => navigate(q.path)}>
                  <span className="qa-icon">{q.icon}</span>
                  <div>
                    <div className="qa-label">{q.label}</div>
                    <div className="qa-sub">{q.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Habits + Transformation */}
        <div className="row-3">
          <div className="card">
            <div className="card-title">
              Today's Habits
              <span className="card-title-action" onClick={() => navigate('/dashboard/habits')}>All habits →</span>
            </div>
            {habits.length > 0 ? habits.map((h, i) => (
              <div key={h._id} className="habit-item">
                <div
                  className={`habit-check ${isCompleted(h) ? 'done' : 'undone'}`}
                  style={{ '--c': colors[i % colors.length], borderColor: colors[i % colors.length] }}
                  onClick={() => toggleHabit(h._id)}
                >
                  {isCompleted(h) ? '✓' : ''}
                </div>
                <span className="habit-name" style={{ textDecoration: isCompleted(h) ? 'line-through' : 'none', color: isCompleted(h) ? '#5a5a72' : '#f0f0ff' }}>
                  {h.icon} {h.name}
                </span>
                {h.streak > 0 && <span className="habit-streak">🔥 {h.streak}</span>}
              </div>
            )) : (
              <div className="empty-state">
                <div className="empty-icon">⚡</div>
                <div>No habits yet</div>
                <button onClick={() => navigate('/dashboard/habits')} style={{ marginTop:'0.75rem', padding:'0.5rem 1.2rem', background:'rgba(255,107,53,0.1)', border:'1px solid rgba(255,107,53,0.2)', borderRadius:'8px', color:'#ff6b35', cursor:'pointer', fontSize:'0.82rem', fontFamily:'DM Sans,sans-serif' }}>
                  Add your first habit
                </button>
              </div>
            )}
          </div>

          <div>
            {transform ? (
              <div className="transform-progress-card">
                <div className="card-title" style={{ marginBottom:'0.5rem' }}>
                  🔥 Active Challenge
                  <span className="card-title-action" onClick={() => navigate('/dashboard/transformation')}>Details →</span>
                </div>
                <div className="transform-title">{transform.title}</div>
                <div className="transform-sub">Day {transform.currentDay} of {transform.totalDays}</div>
                <div className="big-progress">
                  <div className="big-progress-fill" style={{ width: `${transform.progress}%` }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.5rem', fontFamily:'JetBrains Mono,monospace', fontSize:'0.72rem', color:'#9898b0' }}>
                  <span>Day 1</span>
                  <span style={{ color:'#ff6b35' }}>{transform.progress}%</span>
                  <span>Day {transform.totalDays}</span>
                </div>
                <div className="day-grid">
                  {Array.from({ length: Math.min(transform.totalDays, 100) }, (_, i) => (
                    <div key={i} className={`day-dot ${i < transform.currentDay ? 'done' : i === transform.currentDay ? 'today' : ''}`} title={`Day ${i+1}`} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign:'center', cursor:'pointer' }} onClick={() => navigate('/dashboard/transformation')}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔥</div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:'1rem', fontWeight:700, color:'#f0f0ff', marginBottom:'0.5rem' }}>Start a Transformation</div>
                <div style={{ fontSize:'0.82rem', color:'#9898b0', marginBottom:'1.5rem' }}>Commit to 30, 75, or 100 days</div>
                <button onClick={e => { e.stopPropagation(); navigate('/dashboard/transformation'); }} style={{ padding:'0.65rem 1.5rem', background:'linear-gradient(135deg,#ff6b35,#f59e0b)', border:'none', borderRadius:'10px', color:'#0a0a0f', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}>
                  Start Challenge →
                </button>
              </div>
            )}

            {/* Activity Heatmap */}
            <div className="card" style={{ marginTop:'1.25rem' }}>
              <div className="card-title">Activity Heatmap</div>
              <div style={{ display:'flex', gap:'3px', overflowX:'auto' }}>
                {heatmapData.map((week, wi) => (
                  <div key={wi} style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                    {week.map((day, di) => {
                      const level = day.ratio === 0 ? '' : day.ratio < 0.25 ? 'l1' : day.ratio < 0.5 ? 'l2' : day.ratio < 0.75 ? 'l3' : 'l4';
                      return <div key={di} className={`heatmap-cell ${level}`} title={`${day.dateStr}: ${Math.round(day.ratio*100)}%`} />;
                    })}
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.75rem', fontSize:'0.72rem', color:'#5a5a72' }}>
                <span>Less</span>
                {['','l1','l2','l3','l4'].map(l => <div key={l} className={`heatmap-cell ${l}`} style={{ flexShrink:0 }} />)}
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
