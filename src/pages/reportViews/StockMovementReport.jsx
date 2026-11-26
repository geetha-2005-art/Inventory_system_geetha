import { useMemo, useState } from 'react';
import { Autocomplete, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import QuantityChange from '../../components/QuantityChange';
import ReportTable from '../../components/ReportTable';
import { useNotification } from '../../hooks/useNotification';
import { useSortedRows } from '../../hooks/useSortedRows';
import { STATUS, TRANSACTION_TYPES } from '../../utils/constants';
import { buildCsv, downloadCsv } from '../../utils/csv';
import { toLocalDateKey, todayKey } from '../../utils/dates';
import { formatDateTime } from '../../utils/format';

// Sort the Date column by real time, not by the formatted text
const SORT_ACCESSORS = { date: (row) => new Date(row.date).getTime() };

const DEFAULT_FILTERS = { product: null, type: 'all', dateFrom: '', dateTo: '' };

const pad = (n) => String(n).padStart(2, '0');

// "2026-11-25 14:30": easy to sort and read in Excel
function csvDateTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${toLocalDateKey(iso)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const COLUMNS = [
  { id: 'id', label: 'Transaction ID' },
  { id: 'date', label: 'Date', render: (row) => formatDateTime(row.date) },
  {
    id: 'productCode',
    label: 'Product',
    render: (row) => (
      <>
        <strong>{row.productCode}</strong>
        <Typography variant="caption" display="block" color="text.secondary">
          {row.productName}
        </Typography>
      </>
    ),
  },
  { id: 'type', label: 'Transaction Type' },
  {
    id: 'quantityChange',
    label: 'Quantity Change',
    align: 'right',
    render: (row) => <QuantityChange value={row.quantityChange} />,
  },
  { id: 'balanceAfter', label: 'Balance After', align: 'right' },
];

const EXPORT_COLUMNS = [
  { label: 'Transaction ID', csv: (r) => r.id },
  { label: 'Date', csv: (r) => csvDateTime(r.date) },
  { label: 'Product Code', csv: (r) => r.productCode },
  { label: 'Product Name', csv: (r) => r.productName },
  { label: 'Transaction Type', csv: (r) => r.type },
  { label: 'Quantity Change', csv: (r) => r.quantityChange },
  { label: 'Balance After', csv: (r) => r.balanceAfter },
];

export default function StockMovementReport({ data }) {
  const { notify } = useNotification();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const hasFilters =
    Boolean(filters.product) || filters.type !== 'all' || filters.dateFrom !== '' || filters.dateTo !== '';
  const rangeInvalid = Boolean(filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo);

  const filteredRows = useMemo(() => {
    if (rangeInvalid) return [];
    return data.movements.filter((row) => {
      if (filters.product && row.productId !== filters.product.id) return false;
      if (filters.type !== 'all' && row.type !== filters.type) return false;
      const day = toLocalDateKey(row.date);
      if (filters.dateFrom && day < filters.dateFrom) return false;
      if (filters.dateTo && day > filters.dateTo) return false;
      return true;
    });
  }, [data.movements, filters, rangeInvalid]);

  const { sort, sortedRows, handleSort } = useSortedRows(
    filteredRows,
    { orderBy: 'date', order: 'desc' },
    SORT_ACCESSORS
  );

  const updateFilter = (name, value) => setFilters((prev) => ({ ...prev, [name]: value }));

  const handleExport = () => {
    try {
      downloadCsv(`stock-movement-report-${todayKey()}.csv`, buildCsv(EXPORT_COLUMNS, sortedRows));
      notify(`Exported ${sortedRows.length} transaction${sortedRows.length === 1 ? '' : 's'} to CSV.`);
    } catch {
      notify('Could not create the CSV file.', 'error');
    }
  };

  const emptyMessage = rangeInvalid
    ? 'Fix the date range to see results.'
    : hasFilters
      ? 'No transactions match the selected filters.'
      : 'No transactions recorded yet.';

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
          <Autocomplete
            size="small"
            sx={{ minWidth: 320 }}
            options={data.products}
            value={filters.product}
            onChange={(_event, product) => updateFilter('product', product)}
            getOptionLabel={(p) =>
              `${p.code} - ${p.name}${p.status === STATUS.INACTIVE ? ' (inactive)' : ''}`
            }
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => <TextField {...params} label="Product" placeholder="All products" />}
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
          <Button
            variant="outlined"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            disabled={!hasFilters}
            sx={{ height: 40 }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {sortedRows.length} of {data.movements.length} transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={sortedRows.length === 0}
        >
          Export CSV
        </Button>
      </Box>

      <ReportTable
        columns={COLUMNS}
        rows={sortedRows}
        sort={sort}
        onSort={handleSort}
        emptyMessage={emptyMessage}
      />
    </Box>
  );
}