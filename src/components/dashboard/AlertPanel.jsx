import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AlertPanel({ alerts = [], title = 'Attention Required (Real-time exceptions)' }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div style={{
      marginBottom: '24px',
      padding: '16px 20px',
      backgroundColor: 'var(--color-error-bg, #FEF2F2)',
      color: 'var(--color-error, #DC2626)',
      borderRadius: '8px',
      border: '1px solid rgba(220, 38, 38, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
        <ShieldAlert size={18} /> <span>{title}</span>
      </div>
      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {alerts.map((alt, idx) => (
          <li key={idx}>{alt}</li>
        ))}
      </ul>
    </div>
  );
}
