import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions({ actions = [], title = 'Quick Operations' }) {
  const navigate = useNavigate();

  if (!actions || actions.length === 0) return null;

  return (
    <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600 }}>{title}</h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {actions.map((act, idx) => (
          <button
            key={idx}
            className={`btn ${act.primary ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => act.path && navigate(act.path)}
          >
            {act.label}
          </button>
        ))}
      </div>
    </div>
  );
}
