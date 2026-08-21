import React from 'react';

const Card = ({ title, subtitle, children, actions, className = '', padding = 'p-6' }) => {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header flex justify-between items-start border-b border-border p-4 sm:p-6 pb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions ml-4">{actions}</div>}
        </div>
      )}
      <div className={`card-body ${padding}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
