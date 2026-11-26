import { useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Alert, Autocomplete, Box, Button, Chip, Link, MenuItem, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Typography,
} from '@mui/material';
import QuantityChange from '../components/QuantityChange';
import { getTransactionHistory } from '../services/historyService';
import { STATUS, TRANSACTION_TYPES } from '../utils/constants';
import { toLocalDateKey } from '../utils/dates';
import { formatDateTime } from '../utils/format';
import { sortRows } from '../utils/table';

const COLUMNS = [
  { id: 'id', label: 'Transaction ID' },
  { id: 'date', label: 'Date' },
  { id: 'productLabel', label: 'Product' },
  { id: 'type', label: 'Type' },
  { id: 'quantityChange', label: 'Quantity Change', align: 'right' },
  { id: 'balanceAfter', label: 'Balance After', align: 'right' },
  { id: 'reference', label: 'Reference' },
  { id: 'remarks', label: 'Remarks' },
];

// Sort the Date column by real time, not by the formatted text
const SORT_ACCESSORS = { date: (row) => new Date(row.date).getTime() };

const TYPE_COLORS = {
  [TRANSACTION_TYPES.OPENING]: 'default',
  [TRANSACTION_TYPES.STOCK_IN]: 'success',
  [TRANSACTION_TYPES.STOCK_OUT]: 'warning',
  [TRANSACTION_TYPES.ADJUSTMENT]: 'info',
};

const DEFAULT_FILTERS = { type: 'all', dateFrom: '', dateTo: '' };

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data] = useState(getTransactionHistory);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState({ orderBy: 'date', order: 'desc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // The product filter lives in the URL: /transactions?product=<id>
  const productParam = searchParams.get('product') || '';
  const selectedProduct = data.products.find((p) => p.id === productParam) || null;
  const productNotFound = Boolean(productParam) && !selectedProduct;

  const hasFilters =
    Boolean(selectedProduct) ||
    filters.type !== DEFAULT_FILTERS.type ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

  const rangeInvalid = Boolean(filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo);

  // 1) filter  2) sort  3) page
  const filteredRows = useMemo(() => {
    if (rangeInvalid) return [];
    return data.rows.filter((row) => {
      if (selectedProduct && row.productId !== selectedProduct.id) return false;
      if (filters.type !== 'all' && row.type !== filters.type) return false;
      const day = toLocalDateKey(row.date);
      if (filters.dateFrom && day < filters.dateFrom) return false;
      if (filters.dateTo && day > filters.dateTo) return false;
      return true;
    });
  }, [data.rows, selectedProduct, filters, rangeInvalid]);

  const sortedRows = useMemo(
    () => sortRows(filteredRows, sort.orderBy, sort.order, SORT_ACCESSORS),
    [filteredRows, sort]
  );

  const pageRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleProductChange = (product) => {
    setSearchParams(product ? { product: product.id } : {});
    setPage(0);
  };

  const updateFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({});
    setPage(0);
  };

  const handleSort = (columnId) => {
    setSort((prev) => ({
      orderBy: columnId,
      order: prev.orderBy === columnId && prev.order === 'asc' ? 'desc' : 'asc',
    }));
    setPage(0);
  };

  if (data.unreadable) {
    return (
      <Alert severity="error">
        Saved inventory data could not be read, so the history cannot be shown. Nothing has been
        overwritten. A backup copy of the unreadable data was kept in browser storage.
      </Alert>
    );
  }

  const emptyMessage = rangeInvalid
    ? 'Fix the date range to see results.'
    : hasFilters
      ? 'No transactions match the selected filters.'
      : 'No transactions recorded yet.';

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Transactions are permanent records. They cannot be edited or deleted. To correct a mistake,
        record a new Stock In, Stock Out or Stock Adjustment.
      </Alert>

      {productNotFound && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          The product in the link was not found, so all transactions are shown.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
          <Autocomplete
            size="small"
            sx={{ minWidth: 320 }}
            options={data.products}
            value={selectedProduct}
            onChange={(_event, product) => handleProductChange(product)}
            getOptionLabel={(p) =>
              `${p.code} - ${p.name}${p.status === STATUS.INACTIVE ? ' (inactive)' : ''}`
            }
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField {...params} label="Product" placeholder="All products" />
            )}
          />
          <TextField
            select
            label="Transaction Type"
            size="small"
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="all">All Types</MenuItem>
            {Object.values(TRANSACTION_TYPES).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="From Date"
            type="date"
            size="small"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            value={filters.dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            error={rangeInvalid}
            helperText={rangeInvalid ? 'To date must be on or after the From date.' : ''}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Button variant="outlined" onClick={clearFilters} disabled={!hasFilters} sx={{ height: 40 }}>
            Clear Filters
          </Button>
        </Box>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Showing {sortedRows.length} of {data.rows.length} transactions
      </Typography>

      <Paper>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    sortDirection={sort.orderBy === col.id ? sort.order : false}
                  >
                    <TableSortLabel
                      active={sort.orderBy === col.id}
                      direction={sort.orderBy === col.id ? sort.order : 'asc'}
                      onClick={() => handleSort(col.id)}
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
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
              {pageRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.id}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(row.date)}</TableCell>
                  <TableCell>
                    <Link component={RouterLink} to={`/products/${row.productId}`} underline="hover">
                      <strong>{row.productCode}</strong>
                    </Link>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {row.productName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.type} color={TYPE_COLORS[row.type] || 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <QuantityChange value={row.quantityChange} />
                  </TableCell>
                  <TableCell align="right">{row.balanceAfter}</TableCell>
                  <TableCell>{row.reference || '-'}</TableCell>
                  <TableCell sx={{ maxWidth: 300, wordBreak: 'break-word' }}>{row.remarks || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sortedRows.length}
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
    </Box>
  );
}