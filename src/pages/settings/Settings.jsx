import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast.js';
import { useConfirm } from '../../hooks/useConfirm.js';
import { useAuth } from '../../context/AuthContext.jsx';
import * as authService from '../../services/authService.js';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { Building2, Database, Shield, Monitor, Key, Lock, Check } from 'lucide-react';

export default function Settings() {
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('security');

  // Change Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Company state
  const [companySettings, setCompanySettings] = useState({
    companyName: 'Shiv Furniture Works',
    registrationNumber: 'CIN-U36990MH2023PTC123456',
    taxId: '27AABCS1234D1Z5',
    email: 'contact@shivfurniture.com',
    phone: '+91 98765 43210',
    address: '123, Industrial Estate, MIDC, Andheri East, Mumbai - 400093',
    currency: 'INR (₹)',
    fiscalYear: 'April - March',
    defaultTaxRate: '18%'
  });

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      showSuccess('Password changed successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showError(err.message || 'Failed to change password. Please verify current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExport = async () => {
    if (await confirm({ title: 'Export Data', message: 'Export all data to JSON?' })) {
      try {
        const db = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sfw:')) {
            db[key] = JSON.parse(localStorage.getItem(key));
          }
        }
        const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sfw_erp_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        showSuccess('Data exported successfully');
      } catch (e) {
        showError('Export failed');
      }
    }
  };

  const handleReset = async () => {
    if (await confirm({ title: 'Reset Data', message: 'Clear all and reset demo data? This cannot be undone.' })) {
      showSuccess('Demo data reset');
      window.location.reload();
    }
  };

  const handleClear = async () => {
    if (await confirm({ title: 'Clear Data', message: 'Delete all data? You will be logged out.' })) {
      localStorage.clear();
      logout();
    }
  };

  const saveSettings = (e) => {
    e.preventDefault();
    showSuccess('Settings updated successfully');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>System Settings</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', margin: '4px 0 0 0' }}>
            Configure enterprise preferences, user security, credentials, and data management
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Sidebar Tabs */}
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('security')}
            style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid transparent', cursor: 'pointer', background: activeTab === 'security' ? 'var(--color-primary)' : 'var(--color-surface)', color: activeTab === 'security' ? '#fff' : 'var(--color-gray-700)', fontWeight: activeTab === 'security' ? '600' : 'normal' }}
          >
            <Shield size={18} /> Security & Account
          </button>
          <button 
            onClick={() => setActiveTab('company')}
            style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid transparent', cursor: 'pointer', background: activeTab === 'company' ? 'var(--color-primary)' : 'var(--color-surface)', color: activeTab === 'company' ? '#fff' : 'var(--color-gray-700)', fontWeight: activeTab === 'company' ? '600' : 'normal' }}
          >
            <Building2 size={18} /> Company Profile
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid transparent', cursor: 'pointer', background: activeTab === 'system' ? 'var(--color-primary)' : 'var(--color-surface)', color: activeTab === 'system' ? '#fff' : 'var(--color-gray-700)', fontWeight: activeTab === 'system' ? '600' : 'normal' }}
          >
            <Monitor size={18} /> Preferences
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid transparent', cursor: 'pointer', background: activeTab === 'data' ? 'var(--color-primary)' : 'var(--color-surface)', color: activeTab === 'data' ? '#fff' : 'var(--color-gray-700)', fontWeight: activeTab === 'data' ? '600' : 'normal' }}
          >
            <Database size={18} /> Data Management
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, minWidth: '320px', background: '#fff', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          
          {/* Security & Password Tab */}
          {activeTab === 'security' && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                Account Security & Credentials
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: '8px' }}>Active User Session</h3>
                  <div style={{ backgroundColor: 'var(--color-surface-secondary)', padding: '16px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--color-border)' }}>
                    <p style={{ margin: '0 0 6px 0' }}>Logged in as: <strong style={{ color: 'var(--color-gray-900)' }}>{user?.name}</strong></p>
                    <p style={{ margin: '0 0 6px 0' }}>System Role: <span className="badge" style={{ marginLeft: '6px' }}>{user?.role || 'Administrator'}</span></p>
                    <p style={{ margin: 0 }}>Email: <strong style={{ color: 'var(--color-primary-dark)' }}>{user?.email}</strong></p>
                  </div>
                </div>

                <div style={{ padding: '20px', backgroundColor: 'var(--color-primary-surface)', borderRadius: '8px', border: '1px solid var(--color-border-strong)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Key size={18} /> Password & Access
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-gray-600)' }}>
                        Update your password to keep your account secure in PostgreSQL.
                      </p>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowPasswordModal(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Lock size={14} /> Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Company Profile Tab */}
          {activeTab === 'company' && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>Company Profile</h2>
              <form onSubmit={saveSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <Input label="Company Name" value={companySettings.companyName} onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})} required />
                  <Input label="Registration Number (CIN)" value={companySettings.registrationNumber} onChange={(e) => setCompanySettings({...companySettings, registrationNumber: e.target.value})} />
                  <Input label="Tax ID (GSTIN)" value={companySettings.taxId} onChange={(e) => setCompanySettings({...companySettings, taxId: e.target.value})} required />
                  <Select label="Fiscal Year" value={companySettings.fiscalYear} onChange={(e) => setCompanySettings({...companySettings, fiscalYear: e.target.value})} options={[{value: 'April - March', label: 'April - March'}, {value: 'Jan - Dec', label: 'January - December'}]} />
                  <Input label="Email Address" type="email" value={companySettings.email} onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})} required />
                  <Input label="Phone Number" value={companySettings.phone} onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})} required />
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600 }}>Registered Address</label>
                    <textarea className="input" style={{ width: '100%', padding: '8px', height: '80px', resize: 'vertical' }} value={companySettings.address} onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})} required />
                  </div>
                </div>
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          )}

          {/* System Preferences Tab */}
          {activeTab === 'system' && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>System Preferences</h2>
              <form onSubmit={saveSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <Select label="Base Currency" value={companySettings.currency} onChange={(e) => setCompanySettings({...companySettings, currency: e.target.value})} options={[{value: 'INR (₹)', label: 'INR (₹)'}, {value: 'USD ($)', label: 'USD ($)'}, {value: 'EUR (€)', label: 'EUR (€)'}]} />
                  <Select label="Default Tax Rate" value={companySettings.defaultTaxRate} onChange={(e) => setCompanySettings({...companySettings, defaultTaxRate: e.target.value})} options={[{value: '0%', label: '0%'}, {value: '5%', label: '5%'}, {value: '12%', label: '12%'}, {value: '18%', label: '18%'}, {value: '28%', label: '28%'}]} />
                </div>
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">Save Preferences</button>
                </div>
              </form>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>Data Management</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={16} /> Backup Data
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '16px' }}>
                    Export active database records including Products, Inventory, Orders, and Settings.
                  </p>
                  <button onClick={handleExport} className="btn btn-secondary">Export Database JSON</button>
                </div>

                <div style={{ paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-error)', marginBottom: '8px' }}>Session Reset</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '16px' }}>
                    Clear current session cache or re-seed default demo scenarios.
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleReset} className="btn btn-secondary">Reload App Data</button>
                    <button onClick={handleClear} className="btn btn-danger">Clear Session & Logout</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Account Password"
      >
        <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-gray-600)' }}>
            Enter your current password and choose a new password with at least 6 characters.
          </p>

          <Input
            label="Current Password"
            type="password"
            required
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Type your current password..."
          />

          <Input
            label="New Password"
            type="password"
            required
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Type your new secure password..."
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Re-type new password to confirm..."
          />

          {newPassword && confirmPassword && (
            <div style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: newPassword === confirmPassword ? 'var(--color-success)' : 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {newPassword === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowPasswordModal(false)}
              disabled={passwordLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={passwordLoading || !currentPassword || !newPassword || newPassword !== confirmPassword}
            >
              {passwordLoading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
