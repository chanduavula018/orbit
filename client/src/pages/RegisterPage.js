import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const styles = `
  @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .auth-page { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; background:#0a0a0f; font-family:'DM Sans',sans-serif; }
  .auth-left { position:relative; padding:3rem; display:flex; flex-direction:column; background:linear-gradient(135deg,#0f0f1a,#0a0a0f); border-right:1px solid rgba(255,255,255,0.04); overflow:hidden; }
  .auth-left-bg { position:absolute; inset:0; background:radial-gradient(ellipse 70% 70% at 30% 40%, rgba(16,185,129,0.15) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 80% 80%, rgba(139,92,246,0.1) 0%, transparent 60%); }
  .auth-left-content { position:relative; z-index:1; flex:1; display:flex; flex-direction:column; justify-content:center; }
  .auth-logo { font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:800; color:#f0f0ff; margin-bottom:4rem; }
  .auth-logo span { color:#ff6b35; }
  .auth-headline { font-family:'Syne',sans-serif; font-size:2.5rem; font-weight:800; color:#f0f0ff; line-height:1.15; margin-bottom:1.5rem; }
  .auth-headline span { background:linear-gradient(135deg,#10b981,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .steps { margin-top:2rem; display:flex; flex-direction:column; gap:1.5rem; }
  .step { display:flex; align-items:flex-start; gap:1rem; }
  .step-num { width:28px; height:28px; border-radius:50%; background:rgba(255,107,53,0.15); border:1px solid rgba(255,107,53,0.3); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:0.75rem; font-weight:700; color:#ff6b35; flex-shrink:0; }
  .step-title { font-size:0.9rem; font-weight:600; color:#f0f0ff; margin-bottom:0.2rem; }
  .step-sub { font-size:0.82rem; color:#9898b0; }
  .auth-right { display:flex; align-items:center; justify-content:center; padding:3rem; background:#0a0a0f; }
  .auth-form-wrap { width:100%; max-width:420px; animation:fadeIn 0.5s ease; }
  .auth-form-title { font-family:'Syne',sans-serif; font-size:1.9rem; font-weight:800; color:#f0f0ff; margin-bottom:0.4rem; }
  .auth-form-sub { font-size:0.9rem; color:#9898b0; margin-bottom:2.5rem; }
  .form-group { margin-bottom:1.2rem; }
  .form-label { display:block; font-size:0.82rem; font-weight:500; color:#9898b0; margin-bottom:0.5rem; }
  .form-input { width:100%; padding:0.85rem 1rem; background:#16161f; border:1px solid rgba(255,255,255,0.08); border-radius:12px; color:#f0f0ff; font-size:0.95rem; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
  .form-input:focus { border-color:rgba(16,185,129,0.4); box-shadow:0 0 0 3px rgba(16,185,129,0.08); }
  .form-input::placeholder { color:#5a5a72; }
  .submit-btn { width:100%; padding:0.95rem; background:linear-gradient(135deg,#10b981,#06b6d4); border:none; border-radius:12px; font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; color:#0a0a0f; cursor:pointer; transition:all 0.2s; margin-top:0.5rem; box-shadow:0 4px 20px rgba(16,185,129,0.3); }
  .submit-btn:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(16,185,129,0.45); }
  .submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .auth-switch { text-align:center; margin-top:1.5rem; font-size:0.88rem; color:#9898b0; }
  .auth-switch a { color:#10b981; font-weight:600; }
  @media (max-width:768px) { .auth-page { grid-template-columns:1fr; } .auth-left { display:none; } }
`;

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Let\'s build some habits 🔥');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-bg" />
          <div className="auth-left-content">
            <div className="auth-logo">🔥 <span>Habit</span>Forge</div>
            <h1 className="auth-headline">Begin your<br /><span>transformation</span><br />today</h1>
            <div className="steps">
              {[
                ['Create your account', 'Takes 30 seconds. No credit card needed.'],
                ['Add your habits', 'Choose from templates or create custom ones.'],
                ['Build your streak', 'Check in daily and watch your consistency grow.'],
              ].map(([t,s], i) => (
                <div key={i} className="step">
                  <div className="step-num">{i+1}</div>
                  <div>
                    <div className="step-title">{t}</div>
                    <div className="step-sub">{s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-wrap">
            <h2 className="auth-form-title">Create account</h2>
            <p className="auth-form-sub">Your journey to discipline starts now.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" type="text" placeholder="Your name"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create account →'}
              </button>
            </form>
            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
