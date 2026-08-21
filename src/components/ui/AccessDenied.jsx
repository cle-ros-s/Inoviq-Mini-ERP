import React from 'react';
import { Lock, ArrowLeft, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const AccessDenied = ({ module }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSwitchToAdmin = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      padding: '24px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '12px',
        padding: '36px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <Lock size={28} />
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
          Access Restricted
        </h1>

        <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, margin: '0 0 24px 0' }}>
          You do not have administrative write permissions to edit the <strong>{module ? String(module).toUpperCase() : 'requested'}</strong> module.
          Please contact your system administrator or switch to an Administrator account.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSwitchToAdmin}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <LogIn size={15} /> Switch to Admin Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
