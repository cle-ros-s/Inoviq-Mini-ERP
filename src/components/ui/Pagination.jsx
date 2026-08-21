import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange, pageSize = 20, onPageSizeChange, total = 0 }) => {
  if (total === 0) return null;

  const validTotalPages = Math.max(1, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= validTotalPages;

  const getPageNumbers = () => {
    const pages = [];
    if (validTotalPages <= 5) {
      for (let i = 1; i <= validTotalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', validTotalPages);
      } else if (currentPage >= validTotalPages - 2) {
        pages.push(1, '...', validTotalPages - 3, validTotalPages - 2, validTotalPages - 1, validTotalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', validTotalPages);
      }
    }
    return pages;
  };

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= validTotalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const buttonBaseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid var(--color-border, #CBD5E1)',
    backgroundColor: '#FFFFFF',
    color: 'var(--color-gray-700, #334155)',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 0.15s ease-in-out'
  };

  const disabledButtonStyle = {
    ...buttonBaseStyle,
    opacity: 0.35,
    cursor: 'not-allowed',
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    color: '#94A3B8'
  };

  const activeButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: 'var(--color-primary-dark, #8B5E3C)',
    borderColor: 'var(--color-primary-dark, #8B5E3C)',
    color: '#FFFFFF',
    fontWeight: 700
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '12px 4px',
      fontSize: '13px',
      color: 'var(--color-gray-600, #475569)'
    }}>
      {/* Showing X to Y of Z entries */}
      <div>
        Showing <strong style={{ color: 'var(--color-gray-900, #0F172A)' }}>{startItem}</strong> to <strong style={{ color: 'var(--color-gray-900, #0F172A)' }}>{endItem}</strong> of <strong style={{ color: 'var(--color-gray-900, #0F172A)' }}>{total}</strong> entries
      </div>
      
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Rows per page selector */}
        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500, #64748B)' }}>Rows:</span>
            {[10, 20, 50, 100].map(sz => (
              <button
                key={sz}
                type="button"
                onClick={() => onPageSizeChange(sz)}
                style={{
                  padding: '3px 8px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: pageSize === sz ? '1px solid var(--color-primary-dark, #8B5E3C)' : '1px solid var(--color-border, #CBD5E1)',
                  backgroundColor: pageSize === sz ? 'rgba(139, 94, 60, 0.1)' : '#FFFFFF',
                  color: pageSize === sz ? 'var(--color-primary-dark, #8B5E3C)' : 'var(--color-gray-700, #334155)',
                  fontWeight: pageSize === sz ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {sz}
              </button>
            ))}
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* First Page */}
          <button 
            type="button"
            style={isFirstPage ? disabledButtonStyle : buttonBaseStyle}
            onClick={() => handlePageClick(1)}
            disabled={isFirstPage}
            title="First Page"
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Previous Page */}
          <button 
            type="button"
            style={isFirstPage ? disabledButtonStyle : buttonBaseStyle}
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={isFirstPage}
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={idx} style={{ padding: '0 4px', color: 'var(--color-gray-400, #94A3B8)' }}>
                  ...
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={idx}
                type="button"
                style={isActive ? activeButtonStyle : buttonBaseStyle}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </button>
            );
          })}

          {/* Next Page */}
          <button 
            type="button"
            style={isLastPage ? disabledButtonStyle : buttonBaseStyle}
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={isLastPage}
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>

          {/* Last Page */}
          <button 
            type="button"
            style={isLastPage ? disabledButtonStyle : buttonBaseStyle}
            onClick={() => handlePageClick(validTotalPages)}
            disabled={isLastPage}
            title="Last Page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
