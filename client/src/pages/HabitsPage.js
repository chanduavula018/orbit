import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const styles = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }

  .habits-page { display:flex; flex-direction:column; gap:1.5rem; }
  .page-header { display:flex; align-items:center; justify-content:space-between; }
  .page-title { font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:800; color:#f0f0ff; }
  .page-sub { font-size:0.85rem; color:#9898b0; margin-top:0.2rem; }

  .add-btn {
    display:flex; align-items:center; gap:0.5rem;
    background:linear-gradient(135deg,#ff6b35,#f59e0b); border:none; border-radius:12px;
    padding:0.75rem 1.4rem; font-family:'Syne',sans-serif; font-size:0.9rem; font-weight:700;
    color:#0a0a0f; cursor:pointer; transition:all 0.2s;
    box-shadow:0 4px 15px rgba(255,107,53,0.3);
  }
  .add-btn:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(255,107,53,0.45); }

  .filter-bar { display:flex; gap:0.75rem; flex-wrap:wrap; }
  .filter-chip {
    padding:0.4rem 1rem; border-radius:50px; font-size:0.82rem; font-weight:500;
    cursor:pointer; border:1px solid rgba(255,255,255,0.08); transition:all 0.15s;
    background:rgba(255,255,255,0.03); color:#9898b0; font-family:'DM Sans',sans-serif;
  }
  .filter-chip.active { background:rgba(255,107,53,0.1); border-color:rgba(255,107,53,0.3); color:#ff6b35; }

  .habits-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1.25rem; }
  .habit-card {
    background:#16161f; border:1px solid rgba(255,255,255,0.06); border-radius:18px;
    padding:1.5rem; transition:all 0.25s; animation:fadeInUp 0.4s ease both;
    position:relative; overflow:hidden;
  }
  .habit-card:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.1); }
  .habit-card-accent { position:absolute; top:0; left:0; right:0; height:3px; border-radius:18px 18px 0 0; }
  
  .habit-card-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:1rem; }
  .habit-icon-wrap { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; }
  .habit-actions { display:flex; gap:0.5rem; }
  .action-btn { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:0.3rem 0.5rem; cursor:pointer; font-size:0.8rem; color:#9898b0; transition:all 0.15s; }
  .action-btn:hover { background:rgba(255,255,255,0.08); color:#f0f0ff; }
  .action-btn.danger:hover { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.2); color:#ef4444; }

  .habit-name { font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; color:#f0f0ff; margin-bottom:0.25rem; }
  .habit-desc { font-size:0.8rem; color:#9898b0; line-height:1.5; margin-bottom:1rem; }
  .habit-category { display:inline-flex; align-items:center; gap:0.3rem; font-size:0.72rem; font-weight:500; padding:0.2rem 0.6rem; border-radius:50px; margin-bottom:1rem; }

  .habit-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; margin-bottom:1.25rem; }
  .habit-stat { background:rgba(255,255,255,0.03); border-radius:8px; padding:0.5rem; text-align:center; }
  .habit-stat-val { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:800; color:#f0f0ff; }
  .habit-stat-lbl { font-size:0.65rem; color:#5a5a72; text-transform:uppercase; letter-spacing:0.05em; }

  .check-btn {
    width:100%; padding:0.7rem; border-radius:12px; border:2px solid;
    font-family:'Syne',sans-serif; font-size:0.88rem; font-weight:700; cursor:pointer;
    transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:0.5rem;
  }
  .check-btn.done { color:#0a0a0f; }
  .check-btn.undone { background:transparent; }

  /* Mini streak calendar */
  .mini-cal { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; margin-bottom:1rem; }
  .cal-dot { height:12px; border-radius:3px; }

  /* Modal */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1rem; }
  .modal { background:#16161f; border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:2rem; width:100%; max-width:520px; animation:slideIn 0.3s ease; max-height:90vh; overflow-y:auto; }
  .modal-title { font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:800; color:#f0f0ff; margin-bottom:1.75rem; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .form-group { margin-bottom:1.25rem; }
  .form-label { display:block; font-size:0.78rem; font-weight:500; color:#9898b0; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.05em; }
  .form-input { width:100%; padding:0.75rem 1rem; background:#1e1e2e; border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#f0f0ff; font-size:0.9rem; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
  .form-input:focus { border-color:rgba(255,107,53,0.4); }
  .form-select { width:100%; padding:0.75rem 1rem; background:#1e1e2e; border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#f0f0ff; font-size:0.9rem; font-family:'DM Sans',sans-serif; outline:none; }
  .icon-grid { display:grid; grid-template-columns:repeat(8,1fr); gap:0.5rem; }
  .icon-opt { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; cursor:pointer; border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.03); transition:all 0.15s; }
  .icon-opt.selected { background:rgba(255,107,53,0.15); border-color:rgba(255,107,53,0.4); }
  .modal-footer { display:flex; gap:0.75rem; justify-content:flex-end; margin-top:1.5rem; }
  .btn-cancel { padding:0.65rem 1.5rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#9898b0; font-family:'Syne',sans-serif; font-size:0.88rem; font-weight:600; cursor:pointer; }
  .btn-save { padding:0.65rem 1.5rem; background:linear-gradient(135deg,#ff6b35,#f59e0b); border:none; border-radius:10px; color:#0a0a0f; font-family:'Syne',sans-serif; font-size:0.88rem; font-weight:700; cursor:pointer; }

  .empty-state { text-align:center; padding:4rem 2rem; }
  .empty-icon { font-size:3.5rem; margin-bottom:1rem; }
  .empty-title { font-family:'Syne',sans-serif; font-size:1.2rem; font-weight:700; color:#f0f0ff; margin-bottom:0.5rem; }
  .empty-sub { font-size:0.88rem; color:#9898b0; }
`;

const ICONS = ['⚡','🔥','💪','📚','🧘','🏃','🎯','🌅','💧','🥗','😴','🎨','🎵','💻','🌱','🏋️','🧠','❤️','⭐','🚀'];
const CATEGORIES = ['all','health','fitness','mindfulness','learning','productivity','social','creative','finance','other'];
const CAT_COLORS = { health:'#10b981', fitness:'#f59e0b', mindfulness:'#8b5cf6', learning:'#06b6d4', productivity:'#ff6b35', social:'#ec4899', creative:'#a78bfa', finance:'#34d399', other:'#9898b0' };

const defaultForm = { name:'', description:'', icon:'⚡', color:'#ff6b35', category:'other', frequency:'daily' };

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchHabits(); }, []);

  const fetchHabits = async () => {
    const res = await api.get('/habits');
    setHabits(res.data);
  };

  const openCreate = () => { setForm(defaultForm); setEditHabit(null); setShowModal(true); };
  const openEdit = (h) => { setForm({ name:h.name, description:h.description, icon:h.icon, color:h.color, category:h.category, frequency:h.frequency }); setEditHabit(h); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setLoading(true);
    try {
      if (editHabit) {
        const res = await api.put(`/habits/${editHabit._id}`, form);
        setHabits(prev => prev.map(h => h._id === editHabit._id ? res.data : h));
        toast.success('Habit updated!');
      } else {
        const res = await api.post('/habits', form);
        setHabits(prev => [res.data, ...prev]);
        toast.success('Habit created! 🔥');
      }
      setShowModal(false);
    } catch (e) { toast.error('Failed to save'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit?')) return;
    await api.delete(`/habits/${id}`);
    setHabits(prev => prev.filter(h => h._id !== id));
    toast.success('Habit deleted');
  };

  const toggleHabit = async (id) => {
    const res = await api.post(`/habits/${id}/toggle`, { date: today });
    setHabits(prev => prev.map(h => h._id === id ? res.data : h));
  };

  const isCompleted = (h) => h.completions?.find(c => c.date === today)?.completed;

  const filtered = filter === 'all' ? habits : habits.filter(h => h.category === filter);

  // Last 21 days for mini calendar
  const last21 = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (20 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <>
      <style>{styles}</style>
      <div className="habits-page">
        <div className="page-header">
          <div>
            <div className="page-title">⚡ Habits</div>
            <div className="page-sub">{habits.length} habits · {habits.filter(isCompleted).length} done today</div>
          </div>
          <button className="add-btn" onClick={openCreate}>+ New Habit</button>
        </div>

        <div className="filter-bar">
          {CATEGORIES.map(c => (
            <button key={c} className={`filter-chip ${filter===c?'active':''}`} onClick={() => setFilter(c)}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <div className="empty-title">No habits yet</div>
            <div className="empty-sub">Build your first routine and start your streak</div>
            <button className="add-btn" style={{ marginTop:'1.5rem' }} onClick={openCreate}>Create First Habit</button>
          </div>
        ) : (
          <div className="habits-grid">
            {filtered.map((h, idx) => {
              const done = isCompleted(h);
              const c = CAT_COLORS[h.category] || '#9898b0';
              const completionRate = h.completions?.length > 0
                ? Math.round((h.completions.filter(c => c.completed).length / Math.max(Math.ceil((new Date() - new Date(h.createdAt)) / 86400000), 1)) * 100)
                : 0;
              return (
                <div key={h._id} className="habit-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="habit-card-accent" style={{ background: `linear-gradient(90deg, ${h.color || c}, transparent)` }} />
                  <div className="habit-card-header">
                    <div className="habit-icon-wrap" style={{ background: `${h.color || c}20` }}>{h.icon}</div>
                    <div className="habit-actions">
                      <button className="action-btn" onClick={() => openEdit(h)}>✏️</button>
                      <button className="action-btn danger" onClick={() => handleDelete(h._id)}>🗑️</button>
                    </div>
                  </div>
                  <div className="habit-name">{h.name}</div>
                  {h.description && <div className="habit-desc">{h.description}</div>}
                  <span className="habit-category" style={{ background: `${c}15`, color: c }}>
                    {h.category}
                  </span>

                  {/* Last 21 days mini calendar */}
                  <div className="mini-cal">
                    {last21.map(date => {
                      const comp = h.completions?.find(c => c.date === date);
                      return (
                        <div key={date} className="cal-dot" style={{ background: comp?.completed ? (h.color || c) : 'rgba(255,255,255,0.04)' }} title={date} />
                      );
                    })}
                  </div>

                  <div className="habit-stats">
                    <div className="habit-stat">
                      <div className="habit-stat-val" style={{ color: '#f59e0b' }}>🔥 {h.streak}</div>
                      <div className="habit-stat-lbl">Streak</div>
                    </div>
                    <div className="habit-stat">
                      <div className="habit-stat-val">{h.longestStreak}</div>
                      <div className="habit-stat-lbl">Best</div>
                    </div>
                    <div className="habit-stat">
                      <div className="habit-stat-val" style={{ color: '#10b981' }}>{completionRate}%</div>
                      <div className="habit-stat-lbl">Rate</div>
                    </div>
                  </div>

                  <button
                    className={`check-btn ${done ? 'done' : 'undone'}`}
                    style={{ borderColor: h.color || c, background: done ? (h.color || c) : 'transparent', color: done ? '#0a0a0f' : (h.color || c) }}
                    onClick={() => toggleHabit(h._id)}
                  >
                    {done ? '✓ Done for today!' : '○ Mark complete'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">{editHabit ? 'Edit Habit' : 'New Habit'}</div>
            <div className="form-group">
              <label className="form-label">Habit Name</label>
              <input className="form-input" placeholder="e.g. Morning run" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Why this habit matters..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {CATEGORIES.filter(c=>c!=='all').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <select className="form-select" value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Icon</label>
              <div className="icon-grid">
                {ICONS.map(ic => (
                  <div key={ic} className={`icon-opt ${form.icon===ic?'selected':''}`} onClick={() => setForm({...form, icon: ic})}>{ic}</div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                {['#ff6b35','#8b5cf6','#06b6d4','#10b981','#ec4899','#f59e0b','#ef4444','#3b82f6'].map(c => (
                  <div key={c} onClick={() => setForm({...form, color: c})} style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer', border: form.color===c ? '3px solid #f0f0ff' : '3px solid transparent', transition:'border 0.15s' }} />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Habit'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
