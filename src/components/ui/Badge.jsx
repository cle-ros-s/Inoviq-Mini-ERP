import React from 'react';

const Badge = ({ count, max = 99, color = 'primary' }) => {
  if (count === undefined || count === null || count === 0) return null;
  
  const displayCount = count > max ? `${max}+` : count;
  
  return (
    <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-${color} rounded-full min-w-[18px] h-[18px]`}>
      {displayCount}
    </span>
  );
};

export default Badge;
