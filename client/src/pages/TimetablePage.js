import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const styles = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }

  .tt-page { display:flex; flex-direction:column; gap:1.5rem; }
  .page-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
  .page-title { font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:800; color:#f0f0ff; }
  .page-sub { font-size:0.85rem; color:#9898b0; margin-top:0.2rem; }
  .add-btn { display:flex; align-items:center; gap:0.5rem; background:linear-gradient(135deg,#8b5cf6,#06b6d4); border:none; border-radius:12px; padding:0.75rem 1.4rem; font-family:'Syne',sans-serif; font-size:0.9rem; font-weight:700; color:#fff; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 15px rgba(139,92,246,0.3); }
  .add-btn:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(139,92,246,0.45); }

  /* Day selector */
  .day-selector { display:flex; gap:0.5rem; overflow-x:auto; padding-bottom:0.25rem; }
  .day-btn {
    flex-shrink:0; padding:0.5rem 1rem; border-radius:50px; border:1px solid rgba(255,255,255,0.08);
    background:rgba(255,255,255,0.03); color:#9898b0; font-family:'DM Sans',sans-serif;
    font-size:0.82rem; font-weight:500; cursor:pointer; transition:all 0.15s; text-align:center;
  }
  .day-btn.active { background:rgba(139,92,246,0.15); border-color:rgba(139,92,246,0.4); color:#8b5cf6; }
  .day-btn.today { border-color:rgba(255,107,53,0.4); }
  .day-num { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:800; display:block; }
  .day-name { font-size:0.68rem; text-transform:uppercase; letter-spacing:0.05em; }

  /* Stats bar */
  .stats-bar { display:flex; gap:1.25rem; padding:1.25rem; background:#16161f; border:1px solid rgba(255,255,255,0.06); border-radius:16px; flex-wrap:wrap; }
  .stat-item { text-align:center; }
  .stat-val { font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:800; color:#8b5cf6; }
  .stat-lbl { font-size:0.72rem; color:#5a5a72; text-transform:uppercase; letter-spacing:0.05em; }
  .progress-section { flex:1; min-width:200px; display:flex; flex-direction:column; justify-content:center; }
  .progress-label { display:flex; justify-content:space-between; font-size:0.78rem; color:#9898b0; margin-bottom:0.4rem; }
  .progress-bar { height:8px; background:rgba(255,255,255,0.06); border-radius:4px; overflow:hidden; }
  .progress-fill { height:100%; background:linear-gradient(90deg,#8b5cf6,#06b6d4); border-radius:4px; transition:width 0.8s ease; }

  /* Timeline */
  .timeline { display:flex; flex-direction:column; gap:0; }
  .time-slot { display:flex; gap:1rem; min-height:60px; }
  .time-label { width:60px; flex-shrink:0; font-family:'JetBrains Mono',monospace; font-size:0.72rem; color:#5a5a72; padding-top:0.25rem; text-align:right; }
  .time-line { width:1px; background:rgba(255,255,255,0.06); flex-shrink:0; position:relative; }
  .time-dot { width:10px; height:10px; border-radius:50%; background:rgba(255,255,255,0.1); position:absolute; left:-4.5px; top:8px; }
  .time-dot.active { background:#8b5cf6; box-shadow:0 0 10px rgba(139,92,246,0.5); }
  .time-content { flex:1; padding:0.25rem 0 1rem; }

  .entry-card {
    background:#16161f; border:1px solid rgba(255,255,255,0.06); border-radius:14px;
    padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem;
    transition:all 0.2s; margin-bottom:0.5rem; animation:fadeInUp 0.3s ease;
  }
  .entry-card:hover { border-color:rgba(255,255,255,0.1); }
  .entry-card.completed { opacity:0.65; }
  .entry-check {
    width:24px; height:24px; border-radius:6px; border:2px solid; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; cursor:pointer;
    transition:all 0.2s; font-size:0.7rem;
  }
  .entry-check.done { color:#0a0a0f; }
  .entry-color-bar { width:4px; height:36px; border-radius:2px; flex-shrink:0; }
  .entry-info { flex:1; }
  .entry-title { font-size:0.9rem; font-weight:600; color:#f0f0ff; }
  .entry-meta { font-size:0.75rem; color:#9898b0; margin-top:0.15rem; }
  .entry-actions { display:flex; gap:0.4rem; opacity:0; transition:opacity 0.2s; }
  .entry-card:hover .entry-actions { opacity:1; }
  .entry-action-btn { background:rgba(255,255,255,0.04); border:none; border-radius:6px; padding:0.25rem 0.4rem; cursor:pointer; font-size:0.78rem; color:#9898b0; transition:all 0.15s; }
  .entry-action-btn:hover { background:rgba(255,255,255,0.08); color:#f0f0ff; }
  .entry-action-btn.del:hover { background:rgba(239,68,68,0.1); color:#ef4444; }

  /* Monthly streak */
  .monthly-section { background:#16161f; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:1.5rem; }
  .monthly-title { font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; color:#f0f0ff; margin-bottom:1.25rem; }
  .monthly-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; }
  .month-day { aspect-ratio:1; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:0.65rem; font-family:'JetBrains Mono',monospace; color:#5a5a72; }
  .month-day.filled { color:#0a0a0f; }
  .month-day.today-cell { border:1px solid #8b5cf6; color:#8b5cf6; }
  .day-labels { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; margin-bottom:4px; }
  .day-label-cell { text-align:center; font-size:0.62rem; color:#5a5a72; text-transform:uppercase; }

  /* Modal */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1rem; }
  .modal { background:#16161f; border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:2rem; width:100%; max-width:500px; animation:slideIn 0.3s ease; max-height:90vh; overflow-y:auto; }
  .modal-title { font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:800; color:#f0f0ff; margin-bottom:1.75rem; }
  .form-group { margin-bottom:1.25rem; }
  .form-label { display:block; font-size:0.78rem; font-weight:500; color:#9898b0; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.05em; }
  .form-input { width:100%; padding:0.75rem 1rem; background:#1e1e2e; border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#f0f0ff; font-size:0.9rem; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
  .form-input:focus { border-color:rgba(139,92,246,0.4); }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .days-check { display:flex; gap:0.5rem; flex-wrap:wrap; }
  .day-check-btn { padding:0.35rem 0.7rem; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:transparent; color:#9898b0; font-size:0.78rem; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
  .day-check-btn.sel { background:rgba(139,92,246,0.15); border-color:rgba(139,92,246,0.4); color:#8b5cf6; }
  .modal-footer { display:flex; gap:0.75rem; justify-content:flex-end; margin-top:1.5rem; }
  .btn-cancel { padding:0.65rem 1.5rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#9898b0; font-family:'Syne',sans-serif; font-size:0.88rem; font-weight:600; cursor:pointer; }
  .btn-save { padding:0.65rem 1.5rem; background:linear-gradient(135deg,#8b5cf6,#06b6d4); border:none; border-radius:10px; color:#fff; font-family:'Syne',sans-serif; font-size:0.88rem; font-weight:700; cursor:pointer; }
`;

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const HOURS = Array.from({length:24},(_,i)=>i);
const COLORS = ['#8b5cf6','#ff6b35','#06b6d4','#10b981','#ec4899','#f59e0b'];

const defaultForm = { title:'', description:'', startTime:'08:00', endTime:'09:00', days:[0,1,2,3,4,5,6], color:'#8b5cf6', icon:'📅', category:'routine' };

export default function TimetablePage() {
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const todayDow = new Date().getDay();

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    const res = await api.get('/timetable');
    setEntries(res.data);
  };

  const dayEntries = entries.filter(e => e.days?.includes(selectedDay));
  const todayEntries = entries.filter(e => e.days?.includes(todayDow));
  const completedToday = todayEntries.filter(e => e.completions?.find(c => c.date === today && c.completed)).length;
  const progress = todayEntries.length > 0 ? Math.round((completedToday / todayEntries.length) * 100) : 0;

  const toggleComplete = async (id) => {
    const res = await api.post(`/timetable/${id}/toggle`, { date: today });
    setEntries(prev => prev.map(e => e._id === id ? res.data : e));
  };

  const isEntryDone = (entry) => entry.completions?.find(c => c.date === today && c.completed);

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title required');
    setLoading(true);
    try {
      if (editEntry) {
        const res = await api.put(`/timetable/${editEntry._id}`, form);
        setEntries(prev => prev.map(e => e._id === editEntry._id ? res.data : e));
        toast.success('Updated!');
      } else {
        const res = await api.post('/timetable', form);
        setEntries(prev => [...prev, res.data]);
        toast.success('Schedule added! 📅');
      }
      setShowModal(false);
    } catch (e) { toast.error('Failed'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await api.delete(`/timetable/${id}`);
    setEntries(prev => prev.filter(e => e._id !== id));
    toast.success('Removed');
  };

  const openCreate = () => { setForm(defaultForm); setEditEntry(null); setShowModal(true); };
  const openEdit = (e) => { setForm({ title:e.title, description:e.description||'', startTime:e.startTime, endTime:e.endTime, days:e.days||[], color:e.color||'#8b5cf6', icon:e.icon||'📅', category:e.category||'routine' }); setEditEntry(e); setShowModal(true); };

  const toggleDay = (d) => setForm(prev => ({ ...prev, days: prev.days.includes(d) ? prev.days.filter(x=>x!==d) : [...prev.days, d] }));

  // Monthly streak data
  const monthDays = Array.from({length:31},(_,i)=>{
    const d = new Date(); d.setDate(1); d.setDate(d.getDate()+i);
    return d;
  }).filter(d => d.getMonth() === new Date().getMonth());

  // Group entries by hour for timeline
  const entriesByHour = {};
  dayEntries.forEach(e => {
    const h = parseInt(e.startTime?.split(':')[0] || 0);
    if (!entriesByHour[h]) entriesByHour[h] = [];
    entriesByHour[h].push(e);
  });

  const currentHour = new Date().getHours();

  return (
    <>
      <style>{styles}</style>
      <div className="tt-page">
        <div className="page-header">
          <div>
            <div className="page-title">📅 Timetable</div>
            <div className="page-sub">Your daily schedule · {completedToday}/{todayEntries.length} done today</div>
          </div>
          <button className="add-btn" onClick={openCreate}>+ Add Schedule</button>
        </div>

        {/* Day Selector */}
        <div className="day-selector">
          {Array.from({length:7},(_,i) => {
            const d = new Date(); d.setDate(d.getDate() - todayDow + i);
            return {
              dow: i, date: d.toISOString().split('T')[0],
              num: d.getDate(), name: DAYS[i]
            };
          }).map(day => (
            <button key={day.dow} className={`day-btn ${selectedDay===day.dow?'active':''} ${day.dow===todayDow?'today':''}`}
              onClick={() => setSelectedDay(day.dow)}>
              <span className="day-num">{day.num}</span>
              <span className="day-name">{day.name}</span>
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-val">{completedToday}</div>
            <div className="stat-lbl">Done</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">{todayEntries.length}</div>
            <div className="stat-lbl">Total</div>
          </div>
          <div className="stat-item">
            <div className="stat-val" style={{color:'#ff6b35'}}>{progress}%</div>
            <div className="stat-lbl">Rate</div>
          </div>
          <div className="progress-section">
            <div className="progress-label">
              <span>Daily completion</span>
              <span style={{color:'#8b5cf6'}}>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${progress}%`}} />
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:'1.5rem'}}>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.9rem',color:'#9898b0',marginBottom:'1rem',textTransform:'uppercase',letterSpacing:'0.08em'}}>
              Timeline — {DAYS[selectedDay]}
            </div>
            {dayEntries.length === 0 ? (
              <div style={{textAlign:'center',padding:'3rem',color:'#5a5a72',fontSize:'0.88rem'}}>
                <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>📅</div>
                <div>No schedule for {DAYS[selectedDay]}</div>
                <button onClick={openCreate} style={{marginTop:'1rem',padding:'0.5rem 1.2rem',background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:'8px',color:'#8b5cf6',cursor:'pointer',fontSize:'0.82rem',fontFamily:'DM Sans,sans-serif'}}>
                  Add schedule item
                </button>
              </div>
            ) : (
              <div className="timeline">
                {HOURS.filter(h => h >= 5 && h <= 23).map(h => {
                  const hEntries = entriesByHour[h] || [];
                  return (
                    <div key={h} className="time-slot">
                      <div className="time-label">{h.toString().padStart(2,'0')}:00</div>
                      <div className="time-line">
                        <div className={`time-dot ${h === currentHour && selectedDay === todayDow ? 'active' : ''}`} />
                      </div>
                      <div className="time-content">
                        {hEntries.map(entry => {
                          const done = isEntryDone(entry) && selectedDay === todayDow;
                          return (
                            <div key={entry._id} className={`entry-card ${done?'completed':''}`}>
                              <div className="entry-check done" style={{ borderColor: entry.color || '#8b5cf6', background: done ? (entry.color || '#8b5cf6') : 'transparent' }}
                                onClick={() => selectedDay === todayDow && toggleComplete(entry._id)}>
                                {done ? '✓' : ''}
                              </div>
                              <div className="entry-color-bar" style={{background: entry.color || '#8b5cf6'}} />
                              <div className="entry-info">
                                <div className="entry-title" style={{textDecoration:done?'line-through':''}}>{entry.icon} {entry.title}</div>
                                <div className="entry-meta">{entry.startTime} – {entry.endTime} · {entry.category}</div>
                              </div>
                              <div className="entry-actions">
                                <button className="entry-action-btn" onClick={() => openEdit(entry)}>✏️</button>
                                <button className="entry-action-btn del" onClick={() => handleDelete(entry._id)}>🗑️</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monthly Streak Panel */}
          <div>
            <div className="monthly-section">
              <div className="monthly-title">📆 Monthly Streak</div>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'0.72rem',color:'#9898b0',marginBottom:'1rem'}}>
                {new Date().toLocaleDateString('en',{month:'long',year:'numeric'})}
              </div>
              <div className="day-labels">
                {DAYS.map(d => <div key={d} className="day-label-cell">{d[0]}</div>)}
              </div>
              <div className="monthly-grid">
                {/* Offset for first day of month */}
                {Array.from({length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()}, (_,i) => (
                  <div key={`e${i}`} />
                ))}
                {monthDays.map(d => {
                  const dateStr = d.toISOString().split('T')[0];
                  const dayEntrs = entries.filter(e => e.days?.includes(d.getDay()));
                  const doneCount = dayEntrs.filter(e => e.completions?.find(c => c.date === dateStr && c.completed)).length;
                  const total = dayEntrs.length;
                  const ratio = total > 0 ? doneCount / total : 0;
                  const isToday = dateStr === today;
                  const bg = ratio === 0 ? 'rgba(255,255,255,0.04)' : ratio < 0.5 ? 'rgba(139,92,246,0.3)' : ratio < 1 ? 'rgba(139,92,246,0.6)' : '#8b5cf6';
                  return (
                    <div key={dateStr} className={`month-day ${ratio>0?'filled':''} ${isToday?'today-cell':''}`}
                      style={{ background: isToday ? 'transparent' : bg }}
                      title={`${dateStr}: ${doneCount}/${total}`}>
                      {d.getDate()}
                    </div>
                  );
                })}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginTop:'1rem',fontSize:'0.72rem',color:'#5a5a72'}}>
                <div style={{width:12,height:12,borderRadius:3,background:'rgba(255,255,255,0.04)'}} />
                <span>None</span>
                <div style={{width:12,height:12,borderRadius:3,background:'rgba(139,92,246,0.3)'}} />
                <span>Partial</span>
                <div style={{width:12,height:12,borderRadius:3,background:'#8b5cf6'}} />
                <span>Full</span>
              </div>
            </div>

            {/* All entries list */}
            <div style={{background:'#16161f',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:'1.5rem',marginTop:'1.25rem'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:'0.95rem',fontWeight:700,color:'#f0f0ff',marginBottom:'1rem'}}>All Schedules</div>
              {entries.map(e => (
                <div key={e._id} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.6rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:e.color||'#8b5cf6',flexShrink:0}} />
                  <div style={{flex:1}}>
                    <div style={{fontSize:'0.85rem',fontWeight:500,color:'#f0f0ff'}}>{e.icon} {e.title}</div>
                    <div style={{fontSize:'0.72rem',color:'#9898b0'}}>{e.startTime}–{e.endTime} · {e.days?.map(d=>DAYS[d][0]).join(' ')}</div>
                  </div>
                  <button onClick={() => handleDelete(e._id)} style={{background:'none',border:'none',cursor:'pointer',color:'#5a5a72',fontSize:'0.85rem'}}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">{editEntry ? 'Edit Schedule' : 'New Schedule Item'}</div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" placeholder="e.g. Morning workout" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input className="form-input" type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input className="form-input" type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Days</label>
              <div className="days-check">
                {DAYS.map((d,i) => (
                  <button key={i} className={`day-check-btn ${form.days?.includes(i)?'sel':''}`} onClick={()=>toggleDay(i)}>{d}</button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Icon</label>
                <input className="form-input" value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} placeholder="📅" />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginTop:'0.1rem'}}>
                  {COLORS.map(c => <div key={c} onClick={()=>setForm({...form,color:c})} style={{width:24,height:24,borderRadius:'50%',background:c,cursor:'pointer',border:form.color===c?'3px solid #f0f0ff':'3px solid transparent'}} />)}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave} disabled={loading}>{loading?'Saving...':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
