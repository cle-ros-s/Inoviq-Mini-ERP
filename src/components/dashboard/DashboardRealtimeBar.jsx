import React, { useState } from 'react';
import { useErpData } from '../../context/ErpDataContext.jsx';
import { RefreshCw, Zap, Radio, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

export default function DashboardRealtimeBar() {
  const {
    lastRefreshedAt,
    triggerRefresh,
    isAutoRefreshEnabled,
    setIsAutoRefreshEnabled,
    autoRefreshInterval,
    setAutoRefreshInterval,
    secondsUntilNextRefresh,
    isSocketConnected
  } = useErpData();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    triggerRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const formattedTime = new Date(lastRefreshedAt).toLocaleTimeString();

  return (
    <div style={{
      marginBottom: '20px',
      padding: '12px 18px',
      background: 'var(--color-surface, #FFFFFF)',
      borderRadius: '10px',
      border: '1px solid var(--color-border, #E2E8F0)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Status Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          backgroundColor: isAutoRefreshEnabled ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          color: isAutoRefreshEnabled ? '#059669' : '#DC2626'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isAutoRefreshEnabled ? '#10B981' : '#EF4444',
            boxShadow: isAutoRefreshEnabled ? '0 0 8px #10B981' : 'none',
            display: 'inline-block'
          }} />
          {isAutoRefreshEnabled ? 'LIVE AUTO-UPDATE ACTIVE' : 'AUTO-UPDATE PAUSED'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-gray-600, #475569)', fontWeight: 500 }}>
          <Radio size={14} color={isSocketConnected ? '#10B981' : '#F59E0B'} />
          <span>{isSocketConnected ? 'WebSocket Connected' : 'Auto Polling'}</span>
        </div>

        {isAutoRefreshEnabled && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-gray-500, #64748B)' }}>
            <Clock size={14} />
            <span>Refreshing in <strong style={{ color: 'var(--color-primary-dark, #1E293B)' }}>{secondsUntilNextRefresh}s</strong></span>
          </div>
        )}
      </div>

      {/* Control Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Toggle Auto Refresh */}
        <button
          onClick={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-gray-700, #334155)',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'background-color 0.2s'
          }}
          title={isAutoRefreshEnabled ? 'Pause live updates' : 'Resume live updates'}
        >
          {isAutoRefreshEnabled ? (
            <ToggleRight size={22} color="#10B981" />
          ) : (
            <ToggleLeft size={22} color="#94A3B8" />
          )}
          <span>Auto-Refresh</span>
        </button>

        {/* Interval Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-600, #475569)' }}>
          <span>Interval:</span>
          <select
            value={autoRefreshInterval}
            onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--color-border, #CBD5E1)',
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-gray-800, #1E293B)',
              cursor: 'pointer'
            }}
            disabled={!isAutoRefreshEnabled}
          >
            <option value={3}>3 sec</option>
            <option value={5}>5 sec</option>
            <option value={10}>10 sec</option>
            <option value={30}>30 sec</option>
            <option value={60}>60 sec</option>
          </select>
        </div>

        {/* Last Refreshed Stamp */}
        <span style={{ fontSize: '11px', color: 'var(--color-gray-400, #94A3B8)' }}>
          Updated {formattedTime}
        </span>

        {/* Manual Refresh Button */}
        <button
          onClick={handleManualRefresh}
          className="btn btn--secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            borderRadius: '6px'
          }}
        >
          <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 0.6s linear infinite' : 'none' }} />
          <span>Refresh Now</span>
        </button>
      </div>
    </div>
  );
}
