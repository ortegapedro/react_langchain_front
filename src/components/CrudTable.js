import React from 'react';
import './shared.css';

// columns: [{ key: string, label: string }]
// rows:    array of objects (each with a unique `id`)
// renderActions: (row) => JSX  — optional action column
// loading:  bool
// emptyMessage: string
function CrudTable({ columns, rows, renderActions, loading, emptyMessage = 'No records found.' }) {
  if (loading) return <p className="table-loading">Loading...</p>;
  if (!rows || rows.length === 0) return <p className="table-empty">{emptyMessage}</p>;

  return (
    <table className="crud-table">
      <thead>
        <tr>
          {columns.map(col => <th key={col.key}>{col.label}</th>)}
          {renderActions && <th>Action</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id}>
            {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
            {renderActions && <td>{renderActions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CrudTable;
