import React from 'react';

const LoadingSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-4 py-2">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex gap-4 items-center">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6 ml-auto"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
