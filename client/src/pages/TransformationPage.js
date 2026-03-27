import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const styles = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(255,107,53,0.3)} 50%{box-shadow:0 0 40px rgba(255,107,53,0.6)} }
  @keyframes fire { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.1)} }

  .transform-page { display:flex; flex-direction:column; gap:1.5rem; }
  .page-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
  .page-title { font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:800; color:#f0f0ff; }
  .page-sub { font-size:0.85rem; color:#9898b0; margin-top:0.2rem; }
  .add-btn { display:flex; align-items:center; gap:0.5rem; background:linear-gradient(135deg,#ff6b35,#f59e0b); border:none; border-radius:12px; padding:0.75rem 1.4rem; font-family:'Syne',sans-serif; font-size:0.9rem; font-weight:700; color:#0a0a0f; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 15px rgba(255,107,53,0.3); }
  .add-btn:hover { transform:translateY(-2px); }

  .challenges-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1.5rem; }
  
  .challenge-card {
    background:#16161f; border:1px solid rgba(255,255,255,0.06); border-radius:20px;
    overflow:hidden; transition:all 0.25s; animation:fadeInUp 0.4s ease;
    position:relative;
  }
  .challenge-card:hover { transform:translateY(-4px); border-color:rgba(255,255,255,0.1); }
  .challenge-card.active { border-color:rgba(255,107,53,0.25); }
  .challenge-card.completed { border-color:rgba(16,185,129,0.25); }

  .challenge-header {
    padding:1.5rem; position:relative; overflow:hidden;
    background:linear-gradient(135deg,rgba(255,107,53,0.08),rgba(245,158,11,0.04));
  }
  .challenge-header.completed-bg { background:linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.04)); }
  .challenge-bg-text {
    position:absolute; right:-10px; bottom:-20px; font-size:5rem; opacity:0.06;
    font-family:'Syne',sans-serif; font-weight:800; line-height:1;
  }
  .challenge-icon { font-size:2.5rem; margin-bottom:0.75rem; display:block; animation:fire 2s ease infinite; }
  .challenge-title { font-family:'Syne',sans-serif; font-size:1.2rem; font-weight:800; color:#f0f0ff; }
  .challenge-sub { font-size:0.82rem; color:#9898b0; margin-top:0.3rem; }

  .challenge-body { padding:1.5rem; }
  
  .progress-ring-wrap { display:flex; align-items:center; gap:1.5rem; margin-bottom:1.5rem; }
  .progress-ring { position:relative; width:80px; height:80px; flex-shrink:0; }
  .ring-svg { transform:rotate(-90deg); }
  .ring-bg { fill:none; stroke:rgba(255,255,255,0.06); stroke-width:6; }
  .ring-fill { fill:none; stroke-width:6; stroke-linecap:round; transition:stroke-dashoffset 1s ease; }
  .ring-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .ring-pct { font-family:'Syne',sans-serif; font-size:0.95rem; font-weight:800; color:#f0f0ff; }
  .ring-label { font-size:0.58rem; color:#5a5a72; text-transform:uppercase; }
  
  .progress-info { flex:1; }
  .day-count { font-family:'Syne',sans-serif; font-size:1.8rem; font-weight:800; color:#ff6b35; line-height:1; }
  .day-total { font-size:0.82rem; color:#9898b0; }

  /* Day grid */
  .day-grid { display:grid; grid-template-columns:repeat(10,1fr); gap:4px; margin-bottom:1.5rem; }
  .d-cell {
    aspect-ratio:1; border-radius:4px; cursor:pointer; transition:all 0.15s;
    display:flex; align-items:center; justify-content:center; font-size:0.55rem;
    font-family:'JetBrains Mono',monospace; color:transparent;
  }
  .d-cell.empty { background:rgba(255,255,255,0.04); }
  .d-cell.empty:hover { background:rgba(255,255,255,0.08); }
  .d-cell.done { color:#0a0a0f; }
  .d-cell.current { border:1px solid; animation:glow 2s ease infinite; }

  /* Milestones */
  .milestones { display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.25rem; }
  .milestone { display:flex; align-items:center; gap:0.75rem; padding:0.5rem 0.75rem; background:rgba(255,255,255,0.03); border-radius:8px; }
  .milestone.achieved { background:rgba(16,185,129,0.08); }
  .milestone-icon { font-size:0.9rem; }
  .milestone-day { font-family:'Syne',sans-serif; font-size:0.82rem; font-weight:700; color:#f0f0ff; }
  .milestone-title { font-size:0.78rem; color:#9898b0; }
  .milestone-check { margin-left:auto; font-size:0.85rem; }

  /* Log day modal */
  .log-modal { background:#16161f; border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:2rem; width:100%; max-width:440px; animation:slideIn 0.3s ease; }
  .log-title { font-family:'Syne',sans-serif; font-size:1.3rem; font-weight:800; color:#f0f0ff; margin-bottom:1.5rem; }
  .mood-selector { display:flex; gap:0.75rem; justify-content:center; margin-bottom:1.5rem; }
  .mood-btn { width:48px; height:48px; border-radius:50%; border:2px solid rgba(255,255,255,0.08); background:transparent; font-size:1.5rem; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; }
  .mood-btn.selected { border-color:#ff6b35; background:rgba(255,107,53,0.15); transform:scale(1.1); }

  /* New challenge modal */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1rem; }
  .modal { background:#16161f; border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:2rem; width:100%; max-width:520px; animation:slideIn 0.3s ease; max-height:90vh; overflow-y:auto; }
  .modal-title { font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:800; color:#f0f0ff; margin-bottom:1.75rem; }
  .form-group { margin-bottom:1.25rem; }
  .form-label { display:block; font-size:0.78rem; font-weight:500; color:#9898b0; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.05em; }
  .form-input { width:100%; padding:0.75rem 1rem; background:#1e1e2e; border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#f0f0ff; font-size:0.9rem; font-family:'DM Sans',sans-serif; outline:none; }
  .form-select { width:100%; padding:0.75rem 1rem; background:#1e1e2e; border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#f0f0ff; font-size:0.9rem; font-family:'DM Sans',sans-serif; outline:none; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .template-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.75rem; }
  .template-btn { padding:0.75rem; border-radius:12px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03); cursor:pointer; transition:all 0.15s; text-align:center; }
  .template-btn:hover,.template-btn.sel { background:rgba(255,107,53,0.1); border-color:rgba(255,107,53,0.3); }
  .template-icon { font-size:1.5rem; margin-bottom:0.3rem; }
  .template-days { font-family:'Syne',sans-serif; font-size:1rem; font-weight:800; color:#ff6b35; }
  .template-name { font-size:0.72rem; color:#9898b0; }
  .modal-footer { display:flex; gap:0.75rem; justify-content:flex-end; margin-top:1.5rem; }
  .btn-cancel { padding:0.65rem 1.5rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#9898b0; font-family:'Syne',sans-serif; font-size:0.88rem; font-weight:600; cursor:pointer; }
  .btn-save { padding:0.65rem 1.5rem; background:linear-gradient(135deg,#ff6b35,#f59e0b); border:none; border-radius:10px; color:#0a0a0f; font-family:'Syne',sans-serif; font-size:0.88rem; font-weight:700; cursor:pointer; }
  
  .empty-state { text-align:center; padding:4rem 2rem; }
  .empty-icon { font-size:4rem; margin-bottom:1rem; animation:fire 2s ease infinite; }
  .empty-title { font-family:'Syne',sans-serif; font-size:1.3rem; font-weight:700; color:#f0f0ff; margin-bottom:0.5rem; }
  .empty-sub { font-size:0.88rem; color:#9898b0; margin-bottom:2rem; }

  .challenge-actions { display:flex; gap:0.75rem; }
  .ch-btn { flex:1; padding:0.65rem; border-radius:10px; border:none; font-family:'Syne',sans-serif; font-size:0.82rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
  .ch-btn.primary { background:linear-gradient(135deg,#ff6b35,#f59e0b); color:#0a0a0f; }
  .ch-btn.secondary { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#9898b0; }
  .ch-btn.secondary:hover { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.2); color:#ef4444; }
`;

const TEMPLATES = [
  { days: 21, icon: '🌱', name: '21 Day Reset' },
  { days: 30, icon: '💪', name: '30 Day Sprint' },
  { days: 75, icon: '🏆', name: '75 Hard' },
  { days: 100, icon: '🔥', name: '100 Days' },
  { days: 365, icon: '🚀', name: '1 Year' },
  { days: 0, icon: '✏️', name: 'Custom' },
];
const MOODS = ['😞','😕','😐','😊','🔥'];
const CHALLENGE_COLORS = { fitness:'#f59e0b', mindfulness:'#8b5cf6', learning:'#06b6d4', productivity:'#ff6b35', health:'#10b981', creative:'#ec4899', custom:'#ff6b35' };

export default function TransformationPage() {
  const [challenges, setChallenges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [logModal, setLogModal] = useState(null); // { challenge, day }
  const [form, setForm] = useState({ title:'', description:'', totalDays:30, category:'custom', icon:'🔥', startDate: new Date().toISOString().split('T')[0] });
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [logForm, setLogForm] = useState({ completed:true, mood:4, note:'' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchChallenges(); }, []);

  const fetchChallenges = async () => {
    const res = await api.get('/transformation');
    setChallenges(res.data);
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return toast.error('Title required');
    setLoading(true);
    try {
      const res = await api.post('/transformation', form);
      setChallenges(prev => [res.data, ...prev]);
      setShowModal(false);
      toast.success('Challenge started! 🔥 Day 1 begins now!');
    } catch (e) { toast.error('Failed'); }
    setLoading(false);
  };

  const handleLogDay = async () => {
    if (!logModal) return;
    const today = new Date().toISOString().split('T')[0];
    const day = logModal.challenge.currentDay + 1;
    setLoading(true);
    try {
      const res = await api.post(`/transformation/${logModal.challenge._id}/log`, { ...logForm, day, date: today });
      setChallenges(prev => prev.map(c => c._id === logModal.challenge._id ? res.data : c));
      setLogModal(null);
      toast.success(res.data.isCompleted ? '🏆 CHALLENGE COMPLETE! You\'re incredible!' : `Day ${day} logged! Keep going! 🔥`);
    } catch (e) { toast.error('Failed'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this challenge?')) return;
    await api.delete(`/transformation/${id}`);
    setChallenges(prev => prev.filter(c => c._id !== id));
    toast.success('Deleted');
  };

  const getColor = (c) => CHALLENGE_COLORS[c.category] || '#ff6b35';

  const selectTemplate = (t) => {
    setSelectedTemplate(t.days);
    if (t.days > 0) setForm(prev => ({ ...prev, totalDays: t.days, icon: t.icon }));
  };

  return (
    <>
      <style>{styles}</style>
      <div className="transform-page">
        <div className="page-header">
          <div>
            <div className="page-title">🔥 Transformation</div>
            <div className="page-sub">{challenges.length} challenge{challenges.length!==1?'s':''} · {challenges.filter(c=>!c.isCompleted).length} active</div>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)}>+ New Challenge</button>
        </div>

        {challenges.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔥</div>
            <div className="empty-title">No challenges yet</div>
            <div className="empty-sub">Start a 30, 75, or 100-day transformation challenge.<br />Show up every day. Watch yourself change.</div>
            <button className="add-btn" style={{ display:'inline-flex' }} onClick={() => setShowModal(true)}>Start Your First Challenge</button>
          </div>
        ) : (
          <div className="challenges-grid">
            {challenges.map((c, idx) => {
              const color = getColor(c);
              const pct = c.totalDays > 0 ? Math.round((c.currentDay / c.totalDays) * 100) : 0;
              const r = 34; const circ = 2 * Math.PI * r;
              const offset = circ - (pct / 100) * circ;
              const today = new Date().toISOString().split('T')[0];
              const todayLogged = c.dailyEntries?.find(e => e.date === today && e.completed);

              return (
                <div key={c._id} className={`challenge-card ${!c.isCompleted?'active':'completed'}`} style={{ animationDelay:`${idx*0.08}s` }}>
                  <div className={`challenge-header ${c.isCompleted?'completed-bg':''}`}>
                    <div className="challenge-bg-text">{c.totalDays}</div>
                    <span className="challenge-icon">{c.icon}</span>
                    <div className="challenge-title">{c.title}</div>
                    <div className="challenge-sub">
                      {c.isCompleted ? '🏆 COMPLETED!' : `Started ${c.startDate} · ${c.totalDays - c.currentDay} days remaining`}
                    </div>
                  </div>

                  <div className="challenge-body">
                    <div className="progress-ring-wrap">
                      <div className="progress-ring">
                        <svg className="ring-svg" width="80" height="80" viewBox="0 0 80 80">
                          <circle className="ring-bg" cx="40" cy="40" r={r} />
                          <circle className="ring-fill" cx="40" cy="40" r={r}
                            stroke={c.isCompleted ? '#10b981' : color}
                            strokeDasharray={circ} strokeDashoffset={offset} />
                        </svg>
                        <div className="ring-center">
                          <div className="ring-pct">{pct}%</div>
                          <div className="ring-label">done</div>
                        </div>
                      </div>
                      <div className="progress-info">
                        <div className="day-count">{c.currentDay}</div>
                        <div className="day-total">of {c.totalDays} days</div>
                        <div style={{ marginTop:'0.4rem', display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                          <span style={{ fontSize:'0.72rem', padding:'0.15rem 0.5rem', borderRadius:'50px', background:`${color}15`, color, fontWeight:600 }}>{c.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Day grid */}
                    <div className="day-grid">
                      {Array.from({length: Math.min(c.totalDays, 100)}, (_, i) => {
                        const dayEntry = c.dailyEntries?.find(e => e.day === i+1);
                        const isCurrent = i === c.currentDay;
                        const isDone = dayEntry?.completed;
                        return (
                          <div key={i} className={`d-cell ${isDone?'done':isCurrent&&!c.isCompleted?'current':'empty'}`}
                            style={{ background: isDone ? color : isCurrent ? `${color}20` : 'rgba(255,255,255,0.04)', borderColor: isCurrent ? color : 'transparent' }}
                            title={`Day ${i+1}${dayEntry ? ` — ${dayEntry.completed ? 'Done ✓' : 'Missed ✗'}` : ''}`}>
                            {isDone && i < 30 ? '✓' : ''}
                          </div>
                        );
                      })}
                    </div>

                    {/* Milestones */}
                    {c.milestones?.length > 0 && (
                      <div className="milestones">
                        {c.milestones.slice(0,3).map((m,i) => (
                          <div key={i} className={`milestone ${m.achieved?'achieved':''}`}>
                            <span className="milestone-icon">{m.achieved ? '🏅' : '🎯'}</span>
                            <div>
                              <div className="milestone-day">Day {m.day}</div>
                              <div className="milestone-title">{m.title}</div>
                            </div>
                            <span className="milestone-check">{m.achieved ? '✅' : `${c.currentDay}/${m.day}`}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="challenge-actions">
                      {!c.isCompleted && !todayLogged && (
                        <button className="ch-btn primary" onClick={() => { setLogForm({completed:true,mood:4,note:''}); setLogModal({challenge:c}); }}>
                          ✓ Log Today (Day {c.currentDay + 1})
                        </button>
                      )}
                      {todayLogged && <button className="ch-btn primary" style={{ background:'rgba(16,185,129,0.15)', color:'#10b981' }} disabled>✅ Today logged!</button>}
                      <button className="ch-btn secondary" onClick={() => handleDelete(c._id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">🔥 New Challenge</div>
            <div className="form-group">
              <label className="form-label">Challenge Template</label>
              <div className="template-grid">
                {TEMPLATES.map(t => (
                  <div key={t.days} className={`template-btn ${selectedTemplate===t.days?'sel':''}`} onClick={()=>selectTemplate(t)}>
                    <div className="template-icon">{t.icon}</div>
                    <div className="template-days">{t.days || '?'}</div>
                    <div className="template-name">{t.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Challenge Title</label>
              <input className="form-input" placeholder="e.g. 75 Hard Fitness Challenge" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Total Days</label>
                <input className="form-input" type="number" min="1" max="365" value={form.totalDays} onChange={e=>setForm({...form,totalDays:parseInt(e.target.value)||30})} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  {['fitness','mindfulness','learning','productivity','health','creative','custom'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <input className="form-input" value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} placeholder="🔥" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleCreate} disabled={loading}>{loading?'Starting...':'Start Challenge 🔥'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Log Day Modal */}
      {logModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setLogModal(null)}>
          <div className="log-modal">
            <div className="log-title">
              {logModal.challenge.icon} Day {logModal.challenge.currentDay + 1} Check-in
            </div>
            <div style={{ textAlign:'center', marginBottom:'1.25rem' }}>
              <div style={{ fontSize:'0.82rem', color:'#9898b0', marginBottom:'0.75rem' }}>How was your energy today?</div>
              <div className="mood-selector">
                {MOODS.map((m,i) => (
                  <button key={i} className={`mood-btn ${logForm.mood===i+1?'selected':''}`} onClick={()=>setLogForm({...logForm,mood:i+1})}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:'1.25rem' }}>
              <label style={{ display:'block', fontSize:'0.78rem', color:'#9898b0', marginBottom:'0.4rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Notes (optional)</label>
              <textarea style={{ width:'100%', padding:'0.75rem', background:'#1e1e2e', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', color:'#f0f0ff', fontSize:'0.88rem', fontFamily:'DM Sans,sans-serif', outline:'none', resize:'vertical', minHeight:'80px' }}
                placeholder="What did you accomplish today?"
                value={logForm.note} onChange={e=>setLogForm({...logForm,note:e.target.value})} />
            </div>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button onClick={()=>setLogModal(null)} style={{ flex:1, padding:'0.75rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'#9898b0', fontFamily:'Syne,sans-serif', fontWeight:600, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleLogDay} disabled={loading} style={{ flex:2, padding:'0.75rem', background:'linear-gradient(135deg,#ff6b35,#f59e0b)', border:'none', borderRadius:'10px', color:'#0a0a0f', fontFamily:'Syne,sans-serif', fontWeight:700, cursor:'pointer' }}>
                {loading ? 'Logging...' : '🔥 Log Day'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
