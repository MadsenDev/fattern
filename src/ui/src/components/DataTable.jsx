import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

export function DataTable({ columns, data, emptyMessage = 'Ingen data å vise', defaultSort = null }) {
  const [sortColumn, setSortColumn] = useState(defaultSort?.column || null);
  const [sortDirection, setSortDirection] = useState(defaultSort?.direction || 'asc');

  const sortedData = useMemo(() => {
    if (!sortColumn || !data || data.length === 0) return data;

    const column = columns.find((col) => col.key === sortColumn);
    if (!column || column.sortable === false) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Use custom sort function if provided
      if (column.sortFn) {
        return column.sortFn(aValue, bValue, a, b) * (sortDirection === 'asc' ? 1 : -1);
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * (sortDirection === 'asc' ? 1 : -1);
      }

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return (aValue.getTime() - bValue.getTime()) * (sortDirection === 'asc' ? 1 : -1);
      }

      // Handle date strings (ISO format)
      const aDate = typeof aValue === 'string' ? new Date(aValue) : null;
      const bDate = typeof bValue === 'string' ? new Date(bValue) : null;
      if (aDate && bDate && !isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return (aDate.getTime() - bDate.getTime()) * (sortDirection === 'asc' ? 1 : -1);
      }

      // Default to string comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection, columns]);

  const handleSort = (columnKey) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column || column.sortable === false) return;

    if (sortColumn === columnKey) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, start with ascending
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-sand/60 bg-white p-12 text-center">
        <p className="text-sm text-ink-subtle">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-sand/60">
      <table className="min-w-full text-sm">
        <thead className="bg-cloud/80 text-ink-subtle">
          <tr>
            {columns.map((column) => {
              const isSortable = column.sortable !== false && column.key !== 'actions';
              const isSorted = sortColumn === column.key;
              const isAsc = sortDirection === 'asc';

              return (
                <th
                  key={column.key}
                  className={`px-4 py-3 font-medium ${column.align === 'right' ? 'text-right' : 'text-left'} ${
                    isSortable ? 'cursor-pointer select-none hover:bg-cloud/100 transition-colors' : ''
                  }`}
                  onClick={() => isSortable && handleSort(column.key)}
                >
                  <div className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : ''}`}>
                    <span>{column.label}</span>
                    {isSortable && (
                      <span className="flex flex-col">
                        <FiChevronUp
                          className={`h-3 w-3 transition-opacity ${
                            isSorted && isAsc ? 'opacity-100 text-brand-600' : 'opacity-30'
                          }`}
                        />
                        <FiChevronDown
                          className={`h-3 w-3 -mt-1 transition-opacity ${
                            isSorted && !isAsc ? 'opacity-100 text-brand-600' : 'opacity-30'
                          }`}
                        />
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-sand/60 bg-white">
          {sortedData.map((row, rowIndex) => (
            <motion.tr
              key={row.id || rowIndex}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: rowIndex * 0.02 }}
              whileHover={{ backgroundColor: 'rgba(var(--color-cloud-rgb), 0.6)' }}
              className="hover:bg-cloud/60"
            >
              {columns.map((column) => {
                const cellValue = row[column.key];
                const content = column.render ? column.render(cellValue, row) : cellValue ?? '—';

                return (
                  <td
                    key={column.key}
                    className={`px-4 py-3 ${column.align === 'right' ? 'text-right' : 'text-left'} ${
                      column.className || ''
                    }`}
                  >
                    {content}
                  </td>
                );
              })}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

