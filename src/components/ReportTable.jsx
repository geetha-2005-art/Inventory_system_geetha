import { useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow,
  TableSortLabel,
} from '@mui/material';

// rows must already be filtered AND sorted by the parent (so the CSV can use the same list)
export default function ReportTable({ columns, rows, sort, onSort, emptyMessage }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Go back to page 1 whenever the filtered/sorted rows change
  const [previousRows, setPreviousRows] = useState(rows);
  if (previousRows !== rows) {
    setPreviousRows(rows);
    setPage(0);
  }

  const pageRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sortDirection={sort.orderBy === col.id ? sort.order : false}
                >
                  <TableSortLabel
                    active={sort.orderBy === col.id}
                    direction={sort.orderBy === col.id ? sort.order : 'asc'}
                    onClick={() => onSort(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
            {pageRows.map((row) => (
              <TableRow key={row.id} hover>
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align}>
                    {col.render ? col.render(row) : (row[col.id] ?? '-')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={(_event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </Paper>
  );
}