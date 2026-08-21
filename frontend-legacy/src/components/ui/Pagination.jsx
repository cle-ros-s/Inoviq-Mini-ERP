import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange, total }) => {
  if (totalPages <= 1 && total === 0) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3">
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-900">{startItem}</span> to <span className="font-medium text-gray-900">{endItem}</span> of <span className="font-medium text-gray-900">{total}</span> entries
      </div>
      
      <div className="flex items-center gap-4">
        <select 
          className="select py-1 pl-2 pr-8 text-sm w-auto"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>

        <div className="flex items-center gap-1">
          <button 
            className="btn-icon w-8 h-8 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button 
            className="btn-icon w-8 h-8 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((page, idx) => (
            <button
              key={idx}
              className={`w-8 h-8 rounded text-sm flex items-center justify-center transition-colors ${
                page === currentPage 
                  ? 'bg-primary text-white font-medium' 
                  : page === '...' 
                    ? 'cursor-default text-gray-400' 
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}

          <button 
            className="btn-icon w-8 h-8 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            className="btn-icon w-8 h-8 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
