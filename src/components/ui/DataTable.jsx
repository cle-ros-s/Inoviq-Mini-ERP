import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Download, Inbox } from 'lucide-react';
import Pagination from './Pagination';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

const DataTable = ({
  columns,
  data = [],
  searchable = true,
  searchPlaceholder = "Search...",
  filters = [],
  onRowClick,
  actions,
  loading = false,
  emptyTitle = "No data found",
  emptyDescription = "There are no records to display at this time.",
  emptyAction,
  defaultPageSize = 20,
  onExport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [activeFilters, setActiveFilters] = useState({});

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    const safeData = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    let result = [...safeData];

    // Global Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => {
        return columns.some(col => {
          if (col.searchable === false) return false;
          const val = item[col.key];
          if (val === undefined || val === null) return false;
          if (typeof val === 'object') {
            const strVal = (val.companyName || val.name || val.code || val.orderNumber || val.poNumber || val.sku || val.title || JSON.stringify(val)).toLowerCase();
            return strVal.includes(lowerSearch);
          }
          return String(val).toLowerCase().includes(lowerSearch);
        });
      });
    }

    // Column Filters
    Object.keys(activeFilters).forEach(filterKey => {
      if (activeFilters[filterKey]) {
        result = result.filter(item => item[filterKey] === activeFilters[filterKey]);
      }
    });

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, activeFilters, columns]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Boundary check: adjust currentPage if out of range
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const currentData = filteredData.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  return (
    <div className="datatable-container">
      <div className="datatable-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
          {searchable && (
            <div className="search-input-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              <input 
                type="text" 
                className="input" 
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ height: '36px' }}
              />
            </div>
          )}
          {filters.map((filter, idx) => (
            <select 
              key={idx}
              className="select"
              style={{ width: 'auto', minWidth: '160px', height: '36px' }}
              value={activeFilters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            >
              <option value="">All {filter.label}s</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
        </div>
        {onExport && (
          <button className="btn btn-secondary" style={{ height: '36px' }} onClick={() => onExport(filteredData)}>
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>

      <div className="datatable-wrapper bg-white rounded-lg border border-border shadow-sm overflow-x-auto">
        <table className="datatable w-full text-left text-sm">
          <thead className="bg-surface-secondary border-b border-border text-gray-700">
            <tr>
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  className={`p-4 font-semibold ${col.sortable !== false ? 'cursor-pointer hover:bg-surface-tertiary select-none' : ''}`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortConfig.key === col.key && (
                      <span className="text-primary">
                        {sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="p-4 font-semibold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="p-4">
                  <LoadingSkeleton rows={5} />
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="p-8">
                  <EmptyState 
                    icon={Inbox}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIndex) => (
                <tr 
                  key={row.id || rowIndex} 
                  className={`border-b border-border last:border-0 hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIndex) => {
                    const rawVal = row[col.key];
                    let cellContent = col.render 
                      ? col.render(row, rawVal) 
                      : rawVal;

                    if (typeof cellContent === 'object' && cellContent !== null && !React.isValidElement(cellContent)) {
                      cellContent = cellContent.companyName || cellContent.name || cellContent.orderNumber || cellContent.poNumber || cellContent.deliveryNumber || cellContent.sku || cellContent.code || cellContent.label || cellContent.title || cellContent.status || '—';
                    } else if (cellContent === undefined || cellContent === null) {
                      cellContent = '—';
                    }

                    return (
                      <td key={colIndex} className="p-4 text-gray-800">
                        {cellContent}
                      </td>
                    );
                  })}
                  {actions && (
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalItems > 0 && (
        <div className="mt-4">
          <Pagination 
            currentPage={safeCurrentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            total={totalItems}
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;
