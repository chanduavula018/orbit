import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const styles = `
  .profile-page { max-width:700px; display:flex; flex-direction:column; gap:1.5rem; }
  .page-title { font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:800; color:#f0f0ff; margin-bottom:0.2rem; }
  .page-sub { font-size:0.85rem; color:#9898b0; }
  .profile-card { background:#16161f; border:1px solid rgba(255,255,255,0.06); border-radius:20px; padding:2rem; }
  .profile-header { display:flex; align-items:center; gap:1.5rem; margin-bottom:2rem; }
  .avatar-big { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#ff6b35,#f59e0b); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:1.8rem; font-weight:800; color:#0a0a0f; flex-shrink:0; }
  .profile-name { font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:800; color:#f0f0ff; }
  .profile-email { font-size:0.85rem; color:#9898b0; }
  .profile-since { font-size:0.75rem; color:#5a5a72; font-family:'JetBrains Mono',monospace; margin-top:0.3rem; }
  .form-group { margin-bottom:1.25rem; }
  .form-label { display:block; font-size:0.78rem; font-weight:500; color:#9898b0; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.05em; }
  .form-input { width:100%; padding:0.75rem 1rem; background:#1e1e2e; border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#f0f0ff; font-size:0.9rem; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
  .form-input:focus { border-color:rgba(255,107,53,0.4); }
  .save-btn { padding:0.75rem 2rem; background:linear-gradient(135deg,#ff6b35,#f59e0b); border:none; border-radius:12px; color:#0a0a0f; font-family:'Syne',sans-serif; font-size:0.9rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
  .save-btn:hover { transform:translateY(-1px); }
  .section-title { font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; color:#f0f0ff; margin-bottom:1.25rem; }
  .divider { height:1px; background:rgba(255,255,255,0.06); margin:1.5rem 0; }
`;

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [loading, setLoading] = useState(false);

  const initials = user?.name ? user.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'U';

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profile', form);
      toast.success('Profile updated!');
    } catch (e) { toast.error('Failed'); }
    setLoading(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="profile-page">
        <div>
          <div className="page-title">👤 Profile</div>
          <div className="page-sub">Manage your account</div>
        </div>

        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-big">{initials}</div>
            <div>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-email">{user?.email}</div>
              <div className="profile-since">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en',{month:'long',year:'numeric'})}</div>
            </div>
          </div>

          <div className="section-title">Edit Profile</div>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <input className="form-input" placeholder="e.g. Building better habits daily..." value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email} disabled style={{opacity:0.5,cursor:'not-allowed'}} />
          </div>
          <button className="save-btn" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
        </div>

        <div className="profile-card" style={{border:'1px solid rgba(239,68,68,0.15)'}}>
          <div className="section-title" style={{color:'#ef4444'}}>Danger Zone</div>
          <p style={{fontSize:'0.85rem',color:'#9898b0',marginBottom:'1rem'}}>These actions are irreversible. Proceed with caution.</p>
          <button style={{padding:'0.65rem 1.5rem',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',color:'#ef4444',fontFamily:'DM Sans,sans-serif',fontWeight:600,cursor:'pointer',fontSize:'0.85rem'}}>
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
}
