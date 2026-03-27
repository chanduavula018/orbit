import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const styles = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
  .tasks-page { display:flex; flex-direction:column; gap:1.5rem; }
  .page-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
  .page-title { font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:800; color:#f0f0ff; }
  .page-sub { font-size:0.85rem; color:#9898b0; margin-top:0.2rem; }
  .add-btn { display:flex; align-items:center; gap:0.5rem; background:linear-gradient(135deg,#10b981,#06b6d4); border:none; border-radius:12px; padding:0.75rem 1.4rem; font-family:'Syne',sans-serif; font-size:0.9rem; font-weight:700; color:#0a0a0f; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 15px rgba(16,185,129,0.3); }
  .add-btn:hover { transform:translateY(-2px); }

  .view-toggle { display:flex; gap:0.4rem; background:rgba(255,255,255,0.04); padding:0.25rem; border-radius:10px; }
  .view-btn { padding:0.4rem 0.9rem; border-radius:8px; border:none; background:transparent; color:#9898b0; font-family:'DM Sans',sans-serif; font-size:0.82rem; font-weight:500; cursor:pointer; transition:all 0.15s; }
  .view-btn.active { background:#16161f; color:#f0f0ff; }

  .toolbar { display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
  .filter-pills { display:flex; gap:0.5rem; flex-wrap:wrap; }
  .pill { padding:0.35rem 0.9rem; border-radius:50px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03); color:#9898b0; font-size:0.8rem; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
  .pill.active { background:rgba(16,185,129,0.1); border-color:rgba(16,185,129,0.3); color:#10b981; }

  /* List view */
  .tasks-list { display:flex; flex-direction:column; gap:0.75rem; }
  .task-item {
    background:#16161f; border:1px solid rgba(255,255,255,0.06); border-radius:14px;
    padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem;
    transition:all 0.2s; animation:fadeInUp 0.3s ease;
  }
  .task-item:hover { border-color:rgba(255,255,255,0.1); transform:translateX(3px); }
  .task-item.completed-item { opacity:0.5; }
  .task-checkbox {
    width:22px; height:22px; border-radius:6px; border:2px solid; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; cursor:pointer;
    transition:all 0.2s; font-size:0.7rem;
  }
  .priority-bar { width:4px; height:32px; border-radius:2px; flex-shrink:0; }
  .task-content { flex:1; }
  .task-title { font-size:0.9rem; font-weight:600; color:#f0f0ff; margin-bottom:0.2rem; }
  .task-meta { display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; }
  .task-tag { font-size:0.72rem; padding:0.1rem 0.5rem; border-radius:50px; font-weight:500; }
  .task-date { font-size:0.72rem; color:#9898b0; font-family:'JetBrains Mono',monospace; }
  .task-right { display:flex; align-items:center; gap:0.5rem; }
  .task-action { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:6px; padding:0.25rem 0.4rem; cursor:pointer; font-size:0.78rem; color:#9898b0; transition:all 0.15s; }
  .task-action:hover { background:rgba(255,255,255,0.08); }
  .task-action.del:hover { background:rgba(239,68,68,0.1); color:#ef4444; }

  /* Kanban view */
  .kanban { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
  .kanban-col { background:#16161f; border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden; }
  .kanban-header { padding:1rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between; }
  .kanban-title { font-family:'Syne',sans-serif; font-size:0.88rem; font-weight:700; }
  .kanban-count { font-family:'JetBrains Mono',monospace; font-size:0.72rem; background:rgba(255,255,255,0.06); padding:0.15rem 0.5rem; border-radius:50px; color:#9898b0; }
  .kanban-items { padding:0.75rem; display:flex; flex-direction:column; gap:0.6rem; min-height:200px; }
  .kanban-card { background:#1e1e2e; border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:0.9rem; cursor:pointer; transition:all 0.2s; }
  .kanban-card:hover { border-color:rgba(255,255,255,0.1); transform:translateY(-2px); }
  .kanban-card-title { font-size:0.85rem; font-weight:500; color:#f0f0ff; margin-bottom:0.5rem; }
  .kanban-card-bottom { display:flex; align-items:center; justify-content:space-between; }

  /* Priority colors */
  .p-low { color:#10b981; background:rgba(16,185,129,0.1); border-color:rgba(16,185,129,0.2); }
  .p-medium { color:#f59e0b; background:rgba(245,158,11,0.1); border-color:rgba(245,158,11,0.2); }
  .p-high { color:#ff6b35; background:rgba(255,107,53,0.1); border-color:rgba(255,107,53,0.2); }
  .p-urgent { color:#ef4444; background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.2); }
  .pbar-low { background:#10b981; }
  .pbar-medium { background:#f59e0b; }
  .pbar-high { background:#ff6b35; }
  .pbar-urgent { background:#ef4444; }

  .summary-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
  .sum-card { background:#16161f; border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:1.25rem; text-align:center; }
  .sum-val { font-family:'Syne',sans-serif; font-size:1.8rem; font-weight:800; }
  .sum-lbl { font-size:0.72rem; color:#5a5a72; text-transform:uppercase; letter-spacing:0.05em; margin-top:0.2rem; }

  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1rem; }
  .modal { background:#16161f; border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:2rem; width:100%; max-width:500px; animation:slideIn 0.3s ease; max-height:90vh; overflow-y:auto; }
  .modal-title { font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:800; color:#f0f0ff; margin-bottom:1.75rem; }
  .form-group { margin-bottom:1.25rem; }
  .form-label { display:block; font-size:0.78rem; font-weight:500; color:#9898b0; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.05em; }
  .form-input { width:100%; padding:0.75rem 1rem; background:#1e1e2e; border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#f0f0ff; font-size:0.9rem; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
  .form-input:focus { border-color:rgba(16,185,129,0.4); }
  .form-select { width:100%; padding:0.75rem 1rem; background:#1e1e2e; border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#f0f0ff; font-size:0.9rem; font-family:'DM Sans',sans-serif; outline:none; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .modal-footer { display:flex; gap:0.75rem; justify-content:flex-end; margin-top:1.5rem; }
  .btn-cancel { padding:0.65rem 1.5rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#9898b0; font-family:'Syne',sans-serif; font-size:0.88rem; font-weight:600; cursor:pointer; }
  .btn-save { padding:0.65rem 1.5rem; background:linear-gradient(135deg,#10b981,#06b6d4); border:none; border-radius:10px; color:#0a0a0f; font-family:'Syne',sans-serif; font-size:0.88rem; font-weight:700; cursor:pointer; }

  .empty-state { text-align:center; padding:3rem; color:#5a5a72; }
  .empty-icon { font-size:2.5rem; margin-bottom:0.75rem; }

  @media (max-width:900px) { .kanban{grid-template-columns:1fr} .summary-row{grid-template-columns:repeat(2,1fr)} }
`;

const PCOLORS = { low:'#10b981', medium:'#f59e0b', high:'#ff6b35', urgent:'#ef4444' };
const defaultForm = { title:'', description:'', priority:'medium', dueDate:'', dueTime:'', category:'general', status:'pending' };

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('list');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    const res = await api.get('/tasks');
    setTasks(res.data);
  };

  const filtered = tasks.filter(t => {
    if (filter === 'today') return t.dueDate === today;
    if (filter === 'pending') return t.status === 'pending' || t.status === 'in-progress';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'urgent') return t.priority === 'urgent' || t.priority === 'high';
    return true;
  });

  const handleToggle = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
    setTasks(prev => prev.map(t => t._id === task._id ? res.data : t));
    if (newStatus === 'completed') toast.success('Task done! ✅');
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
    toast.success('Deleted');
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title required');
    setLoading(true);
    try {
      if (editTask) {
        const res = await api.put(`/tasks/${editTask._id}`, form);
        setTasks(prev => prev.map(t => t._id === editTask._id ? res.data : t));
        toast.success('Updated!');
      } else {
        const res = await api.post('/tasks', form);
        setTasks(prev => [res.data, ...prev]);
        toast.success('Task added! ✅');
      }
      setShowModal(false);
    } catch (e) { toast.error('Failed'); }
    setLoading(false);
  };

  const openCreate = () => { setForm({...defaultForm, dueDate: today}); setEditTask(null); setShowModal(true); };
  const openEdit = (t) => { setForm({ title:t.title, description:t.description||'', priority:t.priority, dueDate:t.dueDate||'', dueTime:t.dueTime||'', category:t.category||'general', status:t.status }); setEditTask(t); setShowModal(true); };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');

  return (
    <>
      <style>{styles}</style>
      <div className="tasks-page">
        <div className="page-header">
          <div>
            <div className="page-title">✅ Tasks</div>
            <div className="page-sub">{pendingTasks.length} pending · {completedTasks.length} done</div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
            <div className="view-toggle">
              <button className={`view-btn ${view==='list'?'active':''}`} onClick={() => setView('list')}>List</button>
              <button className={`view-btn ${view==='kanban'?'active':''}`} onClick={() => setView('kanban')}>Kanban</button>
            </div>
            <button className="add-btn" onClick={openCreate}>+ New Task</button>
          </div>
        </div>

        {/* Summary */}
        <div className="summary-row">
          {[
            { val: tasks.length, lbl: 'Total', color: '#f0f0ff' },
            { val: pendingTasks.length, lbl: 'Pending', color: '#f59e0b' },
            { val: completedTasks.length, lbl: 'Completed', color: '#10b981' },
            { val: tasks.filter(t=>t.priority==='urgent').length, lbl: 'Urgent', color: '#ef4444' },
          ].map((s,i) => (
            <div key={i} className="sum-card">
              <div className="sum-val" style={{ color: s.color }}>{s.val}</div>
              <div className="sum-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        <div className="toolbar">
          <div className="filter-pills">
            {['all','today','pending','completed','urgent'].map(f => (
              <button key={f} className={`pill ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {view === 'list' ? (
          <div className="tasks-list">
            {filtered.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">✅</div><div>No tasks here</div></div>
            ) : filtered.map(task => (
              <div key={task._id} className={`task-item ${task.status==='completed'?'completed-item':''}`}>
                <div className="task-checkbox"
                  style={{ borderColor: PCOLORS[task.priority], background: task.status==='completed' ? PCOLORS[task.priority] : 'transparent', color:'#0a0a0f' }}
                  onClick={() => handleToggle(task)}>
                  {task.status === 'completed' ? '✓' : ''}
                </div>
                <div className={`priority-bar pbar-${task.priority}`} />
                <div className="task-content">
                  <div className="task-title" style={{ textDecoration: task.status==='completed' ? 'line-through' : 'none' }}>
                    {task.title}
                  </div>
                  <div className="task-meta">
                    <span className={`task-tag p-${task.priority}`}>{task.priority}</span>
                    <span className={`task-tag p-${task.status==='completed'?'low':task.status==='in-progress'?'medium':'high'}`}>{task.status}</span>
                    {task.dueDate && <span className="task-date">📅 {task.dueDate}</span>}
                    {task.category && <span style={{ fontSize:'0.72rem', color:'#5a5a72' }}>{task.category}</span>}
                  </div>
                </div>
                <div className="task-right">
                  {task.status !== 'completed' && (
                    <button className="task-action" onClick={() => api.put(`/tasks/${task._id}`,{status:'in-progress'}).then(r => setTasks(p=>p.map(t=>t._id===task._id?r.data:t)))}>
                      ▶
                    </button>
                  )}
                  <button className="task-action" onClick={() => openEdit(task)}>✏️</button>
                  <button className="task-action del" onClick={() => handleDelete(task._id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="kanban">
            {[
              { status: 'pending', label: 'Pending', color: '#f59e0b', tasks: filtered.filter(t=>t.status==='pending') },
              { status: 'in-progress', label: 'In Progress', color: '#8b5cf6', tasks: filtered.filter(t=>t.status==='in-progress') },
              { status: 'completed', label: 'Completed', color: '#10b981', tasks: filtered.filter(t=>t.status==='completed') },
            ].map(col => (
              <div key={col.status} className="kanban-col">
                <div className="kanban-header">
                  <span className="kanban-title" style={{ color: col.color }}>{col.label}</span>
                  <span className="kanban-count">{col.tasks.length}</span>
                </div>
                <div className="kanban-items">
                  {col.tasks.map(task => (
                    <div key={task._id} className="kanban-card" onClick={() => openEdit(task)}>
                      <div className="kanban-card-title">{task.title}</div>
                      <div className="kanban-card-bottom">
                        <span className={`task-tag p-${task.priority}`}>{task.priority}</span>
                        {task.dueDate && <span style={{ fontSize:'0.68rem', color:'#5a5a72', fontFamily:'JetBrains Mono,monospace' }}>{task.dueDate}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">{editTask ? 'Edit Task' : 'New Task'}</div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" placeholder="What needs to be done?" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Optional details..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" placeholder="e.g. work, personal" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave} disabled={loading}>{loading?'Saving...':'Save Task'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
