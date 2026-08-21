import React from 'react';

const FormRow = ({ children, columns = 2, className = '' }) => {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
  }[columns] || 'grid-cols-1 md:grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-6 mb-4 ${className}`}>
      {children}
    </div>
  );
};

export default FormRow;
