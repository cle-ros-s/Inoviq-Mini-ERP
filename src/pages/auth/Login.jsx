import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, AlertCircle, Mail, Lock, BarChart3, PieChart, 
  ShieldCheck, UserCheck, Crown, ShoppingBag, Factory, Warehouse 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { login } from '../../services/authService.js';
import { useToast } from '../../hooks/useToast.js';
import logoImg from '../../logo.png';
import '../../styles/auth.css';

const QUICK_ACCOUNTS = [
  { role: 'Admin', email: 'admin@shivfurniture.com', icon: Crown, color: '#FFFFFF' },
  { role: 'Sales', email: 'sales@shivfurniture.com', icon: ShoppingBag, color: '#10B981' },
  { role: 'Purchase', email: 'purchase@shivfurniture.com', icon: ShoppingBag, color: '#8B5CF6' },
  { role: 'Production', email: 'manufacturing@shivfurniture.com', icon: Factory, color: '#F97316' },
  { role: 'Inventory', email: 'inventory@shivfurniture.com', icon: Warehouse, color: '#3B82F6' },
];

export default function Login() {
  const { login: setAuthUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@shivfurniture.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="auth-layout">
      {/* Left Brand Identity Panel */}
      <div className="auth-brand-panel">
        {/* Top Header */}
        <div className="auth-brand-header">
          <div className="auth-logo-badge" style={{ backgroundColor: '#FFFFFF', padding: '6px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logoImg} alt="Shiv Furniture Works Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 className="auth-brand-title">SHIV FURNITURE WORKS</h1>
            <div className="auth-brand-subtitle">Mini ERP</div>
          </div>
        </div>

        {/* Center Mission & Headline */}
        <div className="auth-brand-center">
          <h2 className="auth-hero-headline">
            Crafting Comfort.<br />
            Delivering Trust.
          </h2>
          <p className="auth-hero-description">
            An integrated ERP solution to manage your furniture business seamlessly — from enquiry to delivery.
          </p>

          {/* 4 Feature Badges */}
          <div className="auth-features-grid">
            <div className="auth-feature-card">
              <div className="auth-feature-icon">
                <BarChart3 size={20} />
              </div>
              <h3 className="auth-feature-title">Integrated Operations</h3>
              <p className="auth-feature-desc">All-in-one business management</p>
            </div>

            <div className="auth-feature-card">
              <div className="auth-feature-icon">
                <PieChart size={20} />
              </div>
              <h3 className="auth-feature-title">Real-time Insights</h3>
              <p className="auth-feature-desc">Make data-driven decisions</p>
            </div>

            <div className="auth-feature-card">
              <div className="auth-feature-icon">
                <ShieldCheck size={20} />
              </div>
              <h3 className="auth-feature-title">Secure & Reliable</h3>
              <p className="auth-feature-desc">Enterprise grade security</p>
            </div>

            <div className="auth-feature-card">
              <div className="auth-feature-icon">
                <UserCheck size={20} />
              </div>
              <h3 className="auth-feature-title">Role-based Access</h3>
              <p className="auth-feature-desc">Right access for the right people</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-brand-footer">
          © 2026 Shiv Furniture Works. All rights reserved.
        </div>
      </div>

      {/* Right Login Card Panel */}
      <div className="auth-login-panel">
        <div className="auth-card">
          {/* Card Header Avatar with Logo Image */}
          <div className="auth-card-avatar" style={{ backgroundColor: '#F7F1EB', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logoImg} alt="Shiv Furniture Works Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain', borderRadius: '8px' }} />
          </div>

          <div className="auth-card-header">
            <h2 className="auth-card-title">Welcome Back</h2>
            <p className="auth-card-subtitle">Sign in to continue to your ERP workspace.</p>
          </div>

          {error && (
            <div className="auth-error-message" role="alert" style={{ marginBottom: '18px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="email">Email Address</label>
              <div className="auth-input-box">
                <Mail className="auth-input-icon-left" size={18} />
                <input
                  id="email"
                  type="email"
                  className="auth-text-input"
                  placeholder="admin@shivfurniture.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="password">Password</label>
              <div className="auth-input-box">
                <Lock className="auth-input-icon-left" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-text-input"
                  placeholder="•••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Quick Access Workspace Pills */}
            <div className="auth-quick-access">
              <span className="auth-quick-label">Quick Access <span style={{ fontWeight: 400 }}>(Choose your workspace)</span></span>
              <div className="auth-pills-row">
                {QUICK_ACCOUNTS.map(acc => {
                  const IconComponent = acc.icon;
                  const isActive = email === acc.email;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      className={`auth-pill-btn ${isActive ? 'auth-pill-btn--active' : ''}`}
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword('Admin@123');
                      }}
                    >
                      <IconComponent size={14} style={{ color: isActive ? '#FFFFFF' : acc.color }} />
                      <span>{acc.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkbox & Forgot Password */}
            <div className="auth-actions-row">
              <label className="auth-remember-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="auth-forgot-link"
                onClick={() => showError('Password reset feature is managed by Administrator.')}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-main-btn"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
