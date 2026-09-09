import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Inbox,
  AlertCircle,
  Eye,
  Filter,
  RotateCcw,
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  title: string;
  description?: string;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onAdd?: () => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchPlaceholder?: string;
  statusFilterField?: keyof T;
  statusOptions?: string[];
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  title,
  description,
  isLoading = false,
  error = null,
  onRefresh,
  onAdd,
  onView,
  onEdit,
  onDelete,
  searchPlaceholder = 'Search records...',
  statusFilterField,
  statusOptions = [],
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Status filtering
  const statusFilteredData = useMemo(() => {
    if (!statusFilterField || statusFilter === 'ALL') return data;
    return data.filter((item) => {
      const val = item[statusFilterField];
      return String(val).toUpperCase() === statusFilter.toUpperCase();
    });
  }, [data, statusFilterField, statusFilter]);

  // Search Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return statusFilteredData;
    const term = searchTerm.toLowerCase();
    return statusFilteredData.filter((item) =>
      columns.some((col) => {
        const val = item[col.key];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
      })
    );
  }, [statusFilteredData, searchTerm, columns]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSortColumn(null);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="app-main-title text-2xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h1>
          {description && <p className="app-subtitle text-sm text-[var(--text-secondary)] mt-1">{description}</p>}
        </div>

        <div className="flex items-center space-x-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-[var(--text-primary)] border border-[var(--border-color)] transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {onAdd && (
            <button
              onClick={onAdd}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New</span>
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar: Search, Status Filter & Page size */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
            />
          </div>

          {statusFilterField && statusOptions.length > 0 && (
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[var(--text-secondary)] hidden sm:block shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto form-select border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(searchTerm || statusFilter !== 'ALL' || sortColumn) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-500/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3 text-xs text-[var(--text-secondary)] shrink-0">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="form-select border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-400 text-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 rounded-lg text-xs transition-colors font-medium"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Main Table Panel */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-[var(--border-color)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-primary)]">
            <thead className="table-header text-xs uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-color)]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={`px-6 py-4 font-semibold ${
                      col.sortable !== false ? 'cursor-pointer select-none hover:text-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        <span className="text-[var(--text-secondary)]">
                          {sortColumn === col.key ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-indigo-500" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {(onView || onEdit || onDelete) && (
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-color)]">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-[var(--text-secondary)] font-medium">Fetching records from server...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-3 bg-slate-500/10 rounded-2xl border border-[var(--border-color)] text-[var(--text-secondary)]">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <p className="text-base font-semibold text-[var(--text-primary)]">No records found</p>
                      <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                        {searchTerm || statusFilter !== 'ALL'
                          ? 'No matching entries found for your filter criteria.'
                          : 'Get started by creating your first entry.'}
                      </p>
                      {onAdd && !searchTerm && statusFilter === 'ALL' && (
                        <button
                          onClick={onAdd}
                          className="mt-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Create Entry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={String(item[keyField])}
                    className="table-row transition-colors group hover:bg-indigo-500/5"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                        {col.render ? col.render(item) : String(item[col.key] ?? '-')}
                      </td>
                    ))}

                    {(onView || onEdit || onDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {onView && (
                            <button
                              onClick={() => onView(item)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="View details & connected pipeline"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="Edit item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {!isLoading && sortedData.length > 0 && (
          <div className="table-footer px-6 py-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
            <div>
              Showing{' '}
              <span className="font-semibold text-[var(--text-primary)]">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-[var(--text-primary)]">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </span>{' '}
              of <span className="font-semibold text-[var(--text-primary)]">{sortedData.length}</span> entries
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-[var(--text-primary)] border border-[var(--border-color)] disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="px-2 font-medium text-[var(--text-primary)]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-[var(--text-primary)] border border-[var(--border-color)] disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
