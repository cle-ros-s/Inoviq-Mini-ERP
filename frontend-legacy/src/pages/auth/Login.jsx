import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { login } from '../../services/authService.js';
import { useToast } from '../../hooks/useToast.js';
import { Mail, Lock, Eye, EyeOff, Package } from 'lucide-react';

const DEMO_ROLES = [
  { role: 'Admin', label: 'Admin', email: 'admin@shivfurniture.com', pass: 'Admin@123' },
  { role: 'Business Owner', label: 'Business Owner', email: 'owner@shivfurniture.com', pass: 'Owner@123' },
  { role: 'Sales Manager', label: 'Sales Manager', email: 'sales@shivfurniture.com', pass: 'Sales@123' },
  { role: 'Purchase Manager', label: 'Purchase Manager', email: 'purchase@shivfurniture.com', pass: 'Purchase@123' },
  { role: 'Manufacturing Lead', label: 'Manufacturing Lead', email: 'manufacturing@shivfurniture.com', pass: 'Manufacturing@123' },
  { role: 'Inventory Manager', label: 'Inventory Manager', email: 'inventory@shivfurniture.com', pass: 'Inventory@123' },
];

export default function Login() {
  const { login: setAuthUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('Admin');
  const [email, setEmail] = useState('admin@shivfurniture.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (roleName) => {
    setSelectedRole(roleName);
    const found = DEMO_ROLES.find(r => r.role === roleName);
    if (found) {
      setEmail(found.email);
      setPassword(found.pass);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = login(email, password, rememberMe);
      setAuthUser(result.session);
      showSuccess(`Signed in successfully as ${result.user.name}`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || 'Invalid credentials. Check your email & password.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Pane - Dark Branding & Roles List */}
      <div className="login-pane-left">
        <div>
          <div className="login-brand-group">
            <div className="login-brand-badge">
              <Package size={26} />
            </div>
            <div>
              <div className="login-brand-title">ShivFurniture</div>
              <div className="login-brand-subtitle">Smart ERP & Supply Chain Operations</div>
            </div>
          </div>

          <div className="login-roles-summary">
            <div className="login-roles-heading">One login, six roles:</div>
            <ul className="login-roles-list">
              <li className="login-role-item"><span className="login-role-dot"></span> Admin</li>
              <li className="login-role-item"><span className="login-role-dot"></span> Business Owner</li>
              <li className="login-role-item"><span className="login-role-dot"></span> Sales Manager</li>
              <li className="login-role-item"><span className="login-role-dot"></span> Purchase Manager</li>
              <li className="login-role-item"><span className="login-role-dot"></span> Manufacturing Lead</li>
              <li className="login-role-item"><span className="login-role-dot"></span> Inventory Manager</li>
            </ul>
          </div>
        </div>

        <div className="login-footer-text">
          SHIVFURNITURE © 2026 • RBAC ENABLED
        </div>
      </div>

      {/* Right Pane - Floating Login Card */}
      <div className="login-pane-right">
        <div className="login-card-floating">
          <h1 className="login-card-title">Sign in to your account</h1>
          <p className="login-card-subtitle">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">EMAIL</label>
              <div className="login-field-wrapper">
                <Mail size={18} className="login-field-icon" />
                <input
                  type="email"
                  className="login-field-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@shivfurniture.com"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">PASSWORD</label>
              <div className="login-field-wrapper">
                <Lock size={18} className="login-field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-field-input"
                  style={{ paddingRight: '42px' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">ROLE</label>
              <select
                className="login-field-select"
                value={selectedRole}
                onChange={e => handleRoleSelect(e.target.value)}
              >
                {DEMO_ROLES.map(r => (
                  <option key={r.role} value={r.role}>
                    {r.label} ({r.email})
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div style={{
                color: '#DC2626',
                fontSize: '13px',
                marginBottom: '16px',
                padding: '10px 14px',
                background: '#FEF2F2',
                borderRadius: '8px',
                border: '1px solid #FCA5A5'
              }}>
                {error}
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
              fontSize: '14px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#F59E0B' }}
                />
                Remember Me
              </label>

              <button
                type="button"
                className="btn-link"
                onClick={() => alert('Demo Mode: Click Sign In directly or select a Role from the dropdown above.')}
                style={{ color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-btn-submit"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#475569' }}>Access is scoped by role after login:</div>
            <div>• Dashboard • Operations • Inventory • Procurement</div>
          </div>
        </div>
      </div>
    </div>
  );
}
