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
import { formatCurrency, formatNumber } from '../../utils/format';

// Sort Stock Status by urgency: Out of Stock, Low Stock, In Stock
const STOCK_RANK = {
  [STOCK_STATUS.OUT_OF_STOCK]: 0,
  [STOCK_STATUS.LOW_STOCK]: 1,
  [STOCK_STATUS.IN_STOCK]: 2,
};
const SORT_ACCESSORS = { stockStatus: (row) => STOCK_RANK[row.stockStatus] };

// Active products by default, so the totals match the Dashboard
const DEFAULT_FILTERS = { search: '', categoryId: 'all', stockStatus: 'all', status: STATUS.ACTIVE };

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
  { id: 'availableStock', label: 'Available Quantity', align: 'right' },
  { id: 'unitCost', label: 'Unit Cost', align: 'right', render: (row) => formatCurrency(row.unitCost) },
  {
    id: 'inventoryValue',
    label: 'Inventory Value',
    align: 'right',
    render: (row) => formatCurrency(row.inventoryValue),
  },
  { id: 'stockStatus', label: 'Stock Status', render: (row) => <StockStatusChip status={row.stockStatus} /> },
];

const EXPORT_COLUMNS = [
  { label: 'Product Code', csv: (r) => r.code },
  { label: 'Product Name', csv: (r) => r.name },
  { label: 'Category', csv: (r) => r.categoryName },
  { label: 'Available Quantity', csv: (r) => r.availableStock },
  { label: 'Unit Cost', csv: (r) => r.unitCost },
  { label: 'Inventory Value', csv: (r) => r.inventoryValue },
  { label: 'Stock Status', csv: (r) => r.stockStatus },
  { label: 'Status', csv: (r) => r.status },
];

export default function CurrentStockReport({ data }) {
  const { notify } = useNotification();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const hasFilters = Object.keys(DEFAULT_FILTERS).some((k) => filters[k] !== DEFAULT_FILTERS[k]);

  const filteredRows = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return data.products.filter((row) => {
      if (term && !row.code.toLowerCase().includes(term) && !row.name.toLowerCase().includes(term)) {
        return false;
      }
      if (filters.categoryId !== 'all' && row.categoryId !== filters.categoryId) return false;
      if (filters.stockStatus !== 'all' && row.stockStatus !== filters.stockStatus) return false;
      if (filters.status !== 'all' && row.status !== filters.status) return false;
      return true;
    });
  }, [data.products, filters]);

  const { sort, sortedRows, handleSort } = useSortedRows(
    filteredRows,
    { orderBy: 'code', order: 'asc' },
    SORT_ACCESSORS
  );

  const totalUnits = sortedRows.reduce((sum, r) => sum + r.availableStock, 0);
  const totalValue = sortedRows.reduce((sum, r) => sum + r.inventoryValue, 0);

  const updateFilter = (name, value) => setFilters((prev) => ({ ...prev, [name]: value }));

  const handleExport = () => {
    try {
      downloadCsv(`current-stock-report-${todayKey()}.csv`, buildCsv(EXPORT_COLUMNS, sortedRows));
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
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All</MenuItem>
            {Object.values(STOCK_STATUS).map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Product Status"
            size="small"
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value={STATUS.ACTIVE}>Active</MenuItem>
            <MenuItem value={STATUS.INACTIVE}>Inactive</MenuItem>
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
          {sortedRows.length} products · {formatNumber(totalUnits)} units · Value {formatCurrency(totalValue)}
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
        emptyMessage="No products match the selected filters."
      />
    </Box>
  );
}