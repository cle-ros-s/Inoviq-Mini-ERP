import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function RecentActivity({ recentActivity = [], title = 'Live Operational Feed' }) {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="card__title" style={{ margin: 0, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: 'var(--color-primary)' }} /> {title}
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>Real-Time Updates</span>
      </div>

      {recentActivity.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: '13px' }}>
          No recent operational transactions found in database for this workspace profile.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentActivity.slice(0, 10).map((act, idx) => (
            <div
              key={act.id || idx}
              onClick={() => act.entityId && act.entity && navigate(`/${act.entity.toLowerCase()}/${act.entityId}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--color-surface-secondary, #F8FAFC)',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                cursor: act.entityId ? 'pointer' : 'default'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                <div style={{ fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{act.user?.name || act.user || 'System'}</span>{' '}
                  <span style={{ color: 'var(--color-gray-600)' }}>performed</span>{' '}
                  <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{act.action}</span>
                  {act.entity && <span style={{ color: 'var(--color-gray-500)' }}> on {act.entity}</span>}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
                {formatRelativeTime(act.timestamp || act.createdAt || new Date())}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
