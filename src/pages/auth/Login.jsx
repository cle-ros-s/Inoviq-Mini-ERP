import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Mail, Lock } from 'lucide-react';
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
      {/* Brand Identity Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-header">
            <h1 className="auth-brand-title">SHIV FURNITURE WORKS</h1>
          </div>
          
          <div className="auth-brand-mission">
            <h2>Crafting Comfort. Delivering Trust.</h2>
            <p>An integrated workspace for managing furniture operations from enquiry to delivery.</p>
          </div>
        </div>
      </div>

      {/* Authentication Panel */}
      <div className="auth-login-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-heading">Sign In</h2>
            <p className="auth-subheading">Type your credentials to enter the ERP workspace.</p>
          </div>

          {error && (
            <div className="auth-error-message" role="alert">
              <AlertCircle size={16} className="auth-error-icon" />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Direct Email Typing Input */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email Address</label>
              <div className="auth-input-wrapper">
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  placeholder="type your email (e.g. admin@shivfurniture.com)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Direct Password Typing Input */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="type your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-visibility-btn"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Quick Fill Chips */}
            <div style={{ marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', display: 'block', marginBottom: '6px' }}>Quick Type Credentials:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {QUICK_ACCOUNTS.map(acc => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword('Admin@123');
                    }}
                    style={{
                      padding: '3px 8px',
                      fontSize: '11px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: email === acc.email ? 'var(--color-primary-surface)' : '#FFFFFF',
                      color: email === acc.email ? 'var(--color-primary-dark)' : 'var(--color-gray-700)',
                      cursor: 'pointer'
                    }}
                  >
                    {acc.role}
                  </button>
                ))}
              </div>
            </div>

            <div className="auth-form-actions">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
              style={{ width: '100%', height: '42px', marginTop: '8px' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
