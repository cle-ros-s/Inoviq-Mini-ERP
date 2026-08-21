import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as userService from '../../services/userService.js';
import Input from '../../components/ui/Input.jsx';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { UserPlus } from 'lucide-react';

const ROLES = [
  { value: 'ADMINISTRATOR', label: 'Administrator' },
  { value: 'SALES_EXECUTIVE', label: 'Sales' },
  { value: 'PURCHASE_MANAGER', label: 'Purchase' },
  { value: 'PRODUCTION_MANAGER', label: 'Production' },
  { value: 'INVENTORY_MANAGER', label: 'Inventory' },
  { value: 'QUALITY_MANAGER', label: 'Quality' },
  { value: 'DELIVERY_MANAGER', label: 'Delivery' },
  { value: 'ACCOUNTS_FINANCE', label: 'Finance' },
  { value: 'BUSINESS_OWNER', label: 'Owner' }
];

export default function UserForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES_EXECUTIVE'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await userService.createUser(formData, user?.id);
      showSuccess(`User account created successfully!`);
      navigate('/users');
    } catch (err) {
      showError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '650px', padding: '24px 16px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="breadcrumb" style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>
            <button className="breadcrumb-link" onClick={() => navigate('/users')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}>
              Users
            </button>
            <span className="breadcrumb-sep"> / </span>
            <span>New User</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Create User Account</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} style={{ color: 'var(--color-primary)' }} /> User Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input 
              label="Full Name" 
              required 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              placeholder="Type user's full name..."
            />

            <Input 
              label="Email Address" 
              required 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
              placeholder="Type email address (e.g. user@shivfurniture.com)..."
            />

            <Input 
              label="Password" 
              required 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({ ...formData, password: e.target.value })} 
              placeholder="Type secure password..."
            />

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', textTransform: 'uppercase' }}>
                Select System Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r.value })}
                    style={{
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: formData.role === r.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: formData.role === r.value ? 'var(--color-primary-surface)' : '#FFFFFF',
                      color: formData.role === r.value ? 'var(--color-primary-dark)' : 'var(--color-gray-700)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/users')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '140px' }}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
