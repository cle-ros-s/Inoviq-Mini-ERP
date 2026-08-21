import React from 'react';

const KPICard = ({ title, value, subtitle, icon: Icon, onClick, loading }) => {
  const isClickable = !!onClick;
  const strValue = String(value ?? 0);
  
  // Dynamic responsive font sizing math to prevent text wrapping or overflow
  let valueFontSize = '24px';
  if (strValue.length > 14) {
    valueFontSize = '15px';
  } else if (strValue.length > 11) {
    valueFontSize = '17px';
  } else if (strValue.length > 8) {
    valueFontSize = '19px';
  }

  return (
    <div 
      className={`kpi-card ${isClickable ? 'kpi-card--clickable' : ''}`}
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '12px',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        minHeight: '92px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div className="kpi-card__content" style={{ flex: 1, minWidth: 0 }}>
        <p className="kpi-card__label" style={{ 
          fontSize: '11px', 
          fontWeight: 600, 
          color: 'var(--color-gray-500, #64748B)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.04em', 
          margin: '0 0 6px 0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {title}
        </p>
        {loading ? (
          <div style={{ height: '24px', width: '80px', background: 'var(--color-gray-200, #E2E8F0)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
        ) : (
          <h3 className="kpi-card__value" style={{ 
            fontSize: valueFontSize, 
            fontWeight: 800, 
            color: 'var(--color-gray-900, #0F172A)', 
            margin: 0, 
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {strValue}
          </h3>
        )}
        {subtitle && (
          <span style={{ fontSize: '11px', color: 'var(--color-gray-400, #94A3B8)', marginTop: '4px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtitle}
          </span>
        )}
      </div>
      
      {Icon && (
        <div 
          className="kpi-card__icon" 
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(139, 94, 60, 0.1)',
            color: 'var(--color-primary-dark, #8B5E3C)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={20} />
        </div>
      )}
    </div>
  );
};

export default KPICard;
