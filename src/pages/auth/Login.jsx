import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Mail, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { login } from '../../services/authService.js';
import { useToast } from '../../hooks/useToast.js';
import '../../styles/auth.css';

const QUICK_ACCOUNTS = [
  { role: 'Admin', email: 'admin@shivfurniture.com' },
  { role: 'Sales', email: 'sales@shivfurniture.com' },
  { role: 'Purchase', email: 'purchase@shivfurniture.com' },
  { role: 'Production', email: 'manufacturing@shivfurniture.com' },
  { role: 'Inventory', email: 'inventory@shivfurniture.com' },
];

export default function Login() {
  const { login: setAuthUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@shivfurniture.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 3D Tilt Card state & mouse handlers
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Rotate max 12 degrees
    const rx = (y / (rect.height / 2)) * -10;
    const ry = (x / (rect.width / 2)) * 10;
    
    cardRef.current.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(10px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password, rememberMe);
      setAuthUser(result.session);
      showSuccess(`Signed in successfully as ${result.user?.name || result.session?.name || 'User'}`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || 'Unable to sign in. Please check your credentials and try again.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-3d-wrapper" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {/* Floating 3D Ambient Lighting Orbs */}
      <div className="auth-3d-orb auth-3d-orb-1"></div>
      <div className="auth-3d-orb auth-3d-orb-2"></div>

      {/* Top Left Corner Branding - Single Straight Line */}
      <div className="auth-3d-topbar">
        <img src="/logo.jpg" alt="Shiv Furniture Works Logo" className="auth-3d-logo" />
        <span className="auth-3d-brand-name">SHIV FURNITURE WORKS</span>
        <span className="auth-3d-brand-tag">Mini ERP</span>
      </div>

      {/* 3D Glassmorphism Form Card */}
      <div className="auth-3d-card" ref={cardRef}>
        <div className="auth-3d-card-content">
          <div className="auth-3d-header">
            <h2 className="auth-3d-heading">Sign In</h2>
            <p className="auth-3d-subheading">Enter your workspace credentials to access the 3D Mini ERP dashboard.</p>
          </div>

          {error && (
            <div className="auth-3d-error" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Address */}
            <div className="auth-3d-field">
              <label className="auth-3d-label" htmlFor="email">Email Address</label>
              <div className="auth-3d-input-box">
                <Mail size={18} className="auth-3d-input-icon" />
                <input
                  id="email"
                  type="email"
                  className="auth-3d-input"
                  placeholder="admin@shivfurniture.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-3d-field">
              <label className="auth-3d-label" htmlFor="password">Password</label>
              <div className="auth-3d-input-box">
                <Lock size={18} className="auth-3d-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-3d-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-3d-toggle-pwd"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Quick Fill 3D Chips */}
            <div className="auth-3d-chips-container">
              <span className="auth-3d-chips-label">Quick Select Role:</span>
              <div className="auth-3d-chips-grid">
                {QUICK_ACCOUNTS.map(acc => (
                  <button
                    key={acc.role}
                    type="button"
                    className={`auth-3d-chip ${email === acc.email ? 'auth-3d-chip--active' : ''}`}
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword('Admin@123');
                    }}
                  >
                    {acc.role}
                  </button>
                ))}
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#CBD5E1', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#F59E0B', width: '16px', height: '16px', borderRadius: '4px', cursor: 'pointer' }}
                />
                <span>Remember session</span>
              </label>

              <span style={{ fontSize: '0.8rem', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Encrypted Session
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-3d-submit-btn"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
