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
    let result = [...data];

    // Global Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => {
        return columns.some(col => {
          if (!col.searchable && searchable) {
            const val = item[col.key];
            return val && String(val).toLowerCase().includes(lowerSearch);
          }
          return false;
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
  }, [data, searchTerm, sortConfig, activeFilters, columns, searchable]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="datatable-container">
      <div className="datatable-toolbar flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-1">
          {searchable && (
            <div className="search-input-wrapper relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                className="input pl-9" 
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
          {filters.map((filter, idx) => (
            <select 
              key={idx}
              className="select w-auto min-w-[150px]"
              value={activeFilters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            >
              <option value="">{filter.label}</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
        </div>
        {onExport && (
          <button className="btn btn-secondary flex items-center gap-2" onClick={() => onExport(filteredData)}>
            <Download className="w-4 h-4" /> Export CSV
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
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="p-4 text-gray-800">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
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
            currentPage={currentPage} 
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
