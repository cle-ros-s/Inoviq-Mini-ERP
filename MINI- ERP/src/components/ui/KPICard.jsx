import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPICard = ({ title, value, subtitle, icon: Icon, onClick, loading }) => {
  const isClickable = !!onClick;
  
  return (
    <div 
      className={`kpi-card ${isClickable ? 'kpi-card--clickable' : ''}`}
      onClick={onClick}
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
      }}
    >
      <div className="kpi-card__content" style={{ flex: 1 }}>
        <p className="kpi-card__label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 6px 0' }}>
          {title}
        </p>
        {loading ? (
          <div style={{ height: '28px', width: '80px', background: 'var(--color-gray-200)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
        ) : (
          <h3 className="kpi-card__value" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-gray-900)', margin: 0, lineHeight: 1 }}>
            {value ?? 0}
          </h3>
        )}
        {subtitle && (
          <span style={{ fontSize: '12px', color: 'var(--color-gray-400)', marginTop: '4px', display: 'block' }}>
            {subtitle}
          </span>
        )}
      </div>
      
      {Icon && (
        <div 
          className="kpi-card__icon" 
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--color-primary-surface)',
            color: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default KPICard;
