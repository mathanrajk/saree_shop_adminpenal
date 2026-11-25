import React from 'react';
import './DataTable.css';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No records found.',
  className = '',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="admin-table-container">
        <div className="admin-table-loading">
          <span className="admin-table-spinner" />
          <span>Loading data...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="admin-table-container">
        <div className="admin-table-empty">
          <div className="admin-empty-icon">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <p className="admin-empty-text">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-table-container ${className}`.trim()}>
      <div className="admin-table-scroll">
        <table className="admin-data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    width: col.width,
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'clickable-row' : ''}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {col.render
                      ? col.render(row, index)
                      : (row as Record<string, any>)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
