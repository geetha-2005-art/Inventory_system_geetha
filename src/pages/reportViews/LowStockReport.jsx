import { useMemo, useState } from 'react';
import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ReportTable from '../../components/ReportTable';
import StockStatusChip from '../../components/StockStatusChip';
import { useNotification } from '../../hooks/useNotification';
import { useSortedRows } from '../../hooks/useSortedRows';
import { STATUS, STOCK_STATUS } from '../../utils/constants';
import { buildCsv, downloadCsv } from '../../utils/csv';
import { todayKey } from '../../utils/dates';
import { formatNumber } from '../../utils/format';
import { getShortfall } from '../../utils/stock';

const SORT_ACCESSORS = {};
const DEFAULT_FILTERS = { search: '', categoryId: 'all', stockStatus: 'all' };

const COLUMNS = [
  {
    id: 'code',
    label: 'Product',
    render: (row) => (
      <>
        <strong>{row.code}</strong>
        <Typography variant="caption" display="block" color="text.secondary">
          {row.name}
        </Typography>
      </>
    ),
  },
  { id: 'categoryName', label: 'Category' },
  { id: 'supplierName', label: 'Supplier' },
  { id: 'availableStock', label: 'Available Quantity', align: 'right' },
  { id: 'reorderLevel', label: 'Reorder Level', align: 'right' },
  { id: 'shortfall', label: 'Shortfall', align: 'right', render: (row) => <strong>{row.shortfall}</strong> },
  { id: 'stockStatus', label: 'Stock Status', render: (row) => <StockStatusChip status={row.stockStatus} /> },
];

const EXPORT_COLUMNS = [
  { label: 'Product Code', csv: (r) => r.code },
  { label: 'Product Name', csv: (r) => r.name },
  { label: 'Category', csv: (r) => r.categoryName },
  { label: 'Supplier', csv: (r) => r.supplierName },
  { label: 'Available Quantity', csv: (r) => r.availableStock },
  { label: 'Reorder Level', csv: (r) => r.reorderLevel },
  { label: 'Shortfall', csv: (r) => r.shortfall },
  { label: 'Stock Status', csv: (r) => r.stockStatus },
];

export default function LowStockReport({ data }) {
  const { notify } = useNotification();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const hasFilters = Object.keys(DEFAULT_FILTERS).some((k) => filters[k] !== DEFAULT_FILTERS[k]);

  // Active products that are Low Stock or Out of Stock (FR-012)
  const lowStockRows = useMemo(
    () =>
      data.products
        .filter((p) => p.status === STATUS.ACTIVE && p.stockStatus !== STOCK_STATUS.IN_STOCK)
        .map((p) => ({ ...p, shortfall: getShortfall(p.availableStock, p.reorderLevel) })),
    [data.products]
  );

  const filteredRows = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return lowStockRows.filter((row) => {
      if (term && !row.code.toLowerCase().includes(term) && !row.name.toLowerCase().includes(term)) {
        return false;
      }
      if (filters.categoryId !== 'all' && row.categoryId !== filters.categoryId) return false;
      if (filters.stockStatus !== 'all' && row.stockStatus !== filters.stockStatus) return false;
      return true;
    });
  }, [lowStockRows, filters]);

  const { sort, sortedRows, handleSort } = useSortedRows(
    filteredRows,
    { orderBy: 'shortfall', order: 'desc' },
    SORT_ACCESSORS
  );

  const totalShortfall = sortedRows.reduce((sum, r) => sum + r.shortfall, 0);

  const updateFilter = (name, value) => setFilters((prev) => ({ ...prev, [name]: value }));

  const handleExport = () => {
    try {
      downloadCsv(`low-stock-report-${todayKey()}.csv`, buildCsv(EXPORT_COLUMNS, sortedRows));
      notify(`Exported ${sortedRows.length} product${sortedRows.length === 1 ? '' : 's'} to CSV.`);
    } catch {
      notify('Could not create the CSV file.', 'error');
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search by code or name"
            size="small"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            sx={{ minWidth: 240 }}
          />
          <TextField
            select
            label="Category"
            size="small"
            value={filters.categoryId}
            onChange={(e) => updateFilter('categoryId', e.target.value)}
            sx={{ minWidth: 190 }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {data.categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Stock Status"
            size="small"
            value={filters.stockStatus}
            onChange={(e) => updateFilter('stockStatus', e.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="all">Low and Out of Stock</MenuItem>
            <MenuItem value={STOCK_STATUS.LOW_STOCK}>{STOCK_STATUS.LOW_STOCK}</MenuItem>
            <MenuItem value={STOCK_STATUS.OUT_OF_STOCK}>{STOCK_STATUS.OUT_OF_STOCK}</MenuItem>
          </TextField>
          <Button variant="outlined" onClick={() => setFilters(DEFAULT_FILTERS)} disabled={!hasFilters}>
            Clear Filters
          </Button>
        </Box>
      </Paper>

      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          {sortedRows.length} products need replenishment · Total shortfall {formatNumber(totalShortfall)} units
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
        emptyMessage={
          hasFilters
            ? 'No products match the selected filters.'
            : 'All active products are above their reorder level.'
        }
      />
    </Box>
  );
}