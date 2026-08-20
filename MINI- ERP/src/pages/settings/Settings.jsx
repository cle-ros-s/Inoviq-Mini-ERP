import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast.js';
import { useConfirm } from '../../hooks/useConfirm.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import { Building2, Database, Shield, Monitor } from 'lucide-react';

export default function Settings() {
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('company');

  // Dummy state for demonstration of settings
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>System Settings</h1>
      </div>
      
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Sidebar Tabs */}
        <div style={{ width: '250px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('company')}
            style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', border: '1px solid transparent', cursor: 'pointer', background: activeTab === 'company' ? '#F59E0B' : 'transparent', color: activeTab === 'company' ? '#fff' : '#475569', fontWeight: activeTab === 'company' ? '600' : 'normal' }}
          >
            <Building2 size={18} /> Company Profile
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', border: '1px solid transparent', cursor: 'pointer', background: activeTab === 'system' ? '#F59E0B' : 'transparent', color: activeTab === 'system' ? '#fff' : '#475569', fontWeight: activeTab === 'system' ? '600' : 'normal' }}
          >
            <Monitor size={18} /> Preferences
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', border: '1px solid transparent', cursor: 'pointer', background: activeTab === 'security' ? '#F59E0B' : 'transparent', color: activeTab === 'security' ? '#fff' : '#475569', fontWeight: activeTab === 'security' ? '600' : 'normal' }}
          >
            <Shield size={18} /> Security & Roles
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', border: '1px solid transparent', cursor: 'pointer', background: activeTab === 'data' ? '#F59E0B' : 'transparent', color: activeTab === 'data' ? '#fff' : '#475569', fontWeight: activeTab === 'data' ? '600' : 'normal' }}
          >
            <Database size={18} /> Data Management
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          
          {activeTab === 'company' && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>Company Profile</h2>
              <form onSubmit={saveSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  <Input label="Company Name" value={companySettings.companyName} onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})} required />
                  <Input label="Registration Number (CIN)" value={companySettings.registrationNumber} onChange={(e) => setCompanySettings({...companySettings, registrationNumber: e.target.value})} />
                  <Input label="Tax ID (GSTIN)" value={companySettings.taxId} onChange={(e) => setCompanySettings({...companySettings, taxId: e.target.value})} required />
                  <Select label="Fiscal Year" value={companySettings.fiscalYear} onChange={(e) => setCompanySettings({...companySettings, fiscalYear: e.target.value})} options={[{value: 'April - March', label: 'April - March'}, {value: 'Jan - Dec', label: 'January - December'}]} />
                  <Input label="Email Address" type="email" value={companySettings.email} onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})} required />
                  <Input label="Phone Number" value={companySettings.phone} onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})} required />
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Registered Address</label>
                    <textarea className="input" style={{ width: '100%', padding: '8px', height: '96px', resize: 'vertical' }} value={companySettings.address} onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})} required />
                  </div>
                </div>
                <div style={{ paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'system' && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>System Preferences</h2>
              <form onSubmit={saveSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  <Select label="Base Currency" value={companySettings.currency} onChange={(e) => setCompanySettings({...companySettings, currency: e.target.value})} options={[{value: 'INR (₹)', label: 'INR (₹)'}, {value: 'USD ($)', label: 'USD ($)'}, {value: 'EUR (€)', label: 'EUR (€)'}]} />
                  <Select label="Default Tax Rate" value={companySettings.defaultTaxRate} onChange={(e) => setCompanySettings({...companySettings, defaultTaxRate: e.target.value})} options={[{value: '0%', label: '0%'}, {value: '5%', label: '5%'}, {value: '12%', label: '12%'}, {value: '18%', label: '18%'}, {value: '28%', label: '28%'}]} />
                  <Select label="Date Format" value="dd/mm/yyyy" onChange={() => {}} options={[{value: 'dd/mm/yyyy', label: 'DD/MM/YYYY'}, {value: 'mm/dd/yyyy', label: 'MM/DD/YYYY'}]} />
                  <Select label="Time Zone" value="ist" onChange={() => {}} options={[{value: 'ist', label: '(GMT+5:30) Indian Standard Time'}]} />
                </div>
                <div style={{ paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">Save Preferences</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>Security & Roles</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Current Session</h3>
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '6px', fontSize: '14px', color: '#334155', border: '1px solid #E2E8F0' }}>
                    <p style={{ margin: '0 0 4px 0' }}>Logged in as: <strong>{user.name}</strong></p>
                    <p style={{ margin: '0 0 4px 0' }}>Role: <strong>{user.role}</strong></p>
                    <p style={{ margin: 0 }}>Email: {user.email}</p>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Password Management</h3>
                  <button className="btn btn-secondary">Change Password</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>Data Management</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                <div>
                  <h3 style={{ fontWeight: '600', color: '#1E293B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Database size={16} /> Backup Data</h3>
                  <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px', margin: 0, paddingBottom: '16px' }}>Export all your current database records including Products, Inventory, Orders, and Settings into a secure JSON file.</p>
                  <button onClick={handleExport} className="btn btn-secondary">Export Database JSON</button>
                </div>

                <div style={{ paddingTop: '24px', borderTop: '1px solid #FEE2E2' }}>
                  <h3 style={{ fontWeight: '600', color: '#DC2626', marginBottom: '8px' }}>Danger Zone</h3>
                  <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px', margin: 0, paddingBottom: '16px' }}>These actions are destructive and cannot be reversed. Please ensure you have exported your data first.</p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={handleReset} className="btn btn-secondary" style={{ color: '#D97706', borderColor: '#D97706' }}>Reset to Demo Data</button>
                    <button onClick={handleClear} className="btn btn-danger">Wipe All Data</button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
