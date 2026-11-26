import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, IconButton, MenuItem, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TableSortLabel, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusChip from '../components/StockStatusChip';
import StockStatusChip from '../components/StockStatusChip';
import { useNotification } from '../hooks/useNotification';
import { getProductList, setProductStatus } from '../services/productService';
import { STATUS, STOCK_STATUS } from '../utils/constants';
import { formatCurrency } from '../utils/format';
import { sortRows } from '../utils/table';

const COLUMNS = [
  { id: 'code', label: 'Product Code' },
  { id: 'name', label: 'Product Name' },
  { id: 'categoryName', label: 'Category' },
  { id: 'supplierName', label: 'Supplier' },
  { id: 'unit', label: 'Unit' },
  { id: 'unitCost', label: 'Unit Cost', align: 'right' },
  { id: 'availableStock', label: 'Available Stock', align: 'right' },
  { id: 'reorderLevel', label: 'Reorder Level', align: 'right' },
  { id: 'stockStatus', label: 'Stock Status' },
  { id: 'status', label: 'Status' },
];

// Sort Stock Status by urgency: Out of Stock, then Low Stock, then In Stock
const STOCK_RANK = {
  [STOCK_STATUS.OUT_OF_STOCK]: 0,
  [STOCK_STATUS.LOW_STOCK]: 1,
  [STOCK_STATUS.IN_STOCK]: 2,
};
const SORT_ACCESSORS = { stockStatus: (row) => STOCK_RANK[row.stockStatus] };

const DEFAULT_FILTERS = { search: '', categoryId: 'all', stockStatus: 'all', status: 'all' };

export default function ProductList() {
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [data, setData] = useState(getProductList);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState({ orderBy: 'code', order: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const hasFilters = Object.keys(DEFAULT_FILTERS).some((k) => filters[k] !== DEFAULT_FILTERS[k]);
  const isDeactivating = confirmTarget?.status === STATUS.ACTIVE;

  const categoryOptions = useMemo(
    () => [...data.categories].sort((a, b) => a.name.localeCompare(b.name)),
    [data.categories]
  );

  // 1) filter  2) sort  3) page
  const filteredRows = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return data.rows.filter((row) => {
      if (term && !row.code.toLowerCase().includes(term) && !row.name.toLowerCase().includes(term)) {
        return false;
      }
      if (filters.categoryId !== 'all' && row.categoryId !== filters.categoryId) return false;
      if (filters.stockStatus !== 'all' && row.stockStatus !== filters.stockStatus) return false;
      if (filters.status !== 'all' && row.status !== filters.status) return false;
      return true;
    });
  }, [data.rows, filters]);

  const sortedRows = useMemo(
    () => sortRows(filteredRows, sort.orderBy, sort.order, SORT_ACCESSORS),
    [filteredRows, sort]
  );

  const pageRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const updateFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
  };

  const handleSort = (columnId) => {
    setSort((prev) => ({
      orderBy: columnId,
      order: prev.orderBy === columnId && prev.order === 'asc' ? 'desc' : 'asc',
    }));
    setPage(0);
  };

  const handleConfirmStatusChange = () => {
    const target = confirmTarget;
    const newStatus = isDeactivating ? STATUS.INACTIVE : STATUS.ACTIVE;
    const outcome = setProductStatus(target.id, newStatus);
    setConfirmTarget(null);

    if (outcome.ok) {
      setData(getProductList());
      notify(`Product "${target.name}" ${newStatus === STATUS.ACTIVE ? 'activated' : 'deactivated'}.`);
    } else {
      notify(outcome.message, 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography color="text.secondary">
          Stock quantities come from transactions. Use Stock In, Stock Out or Stock Adjustment to change them.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/new')}
          disabled={data.unreadable}
          sx={{ flexShrink: 0 }}
        >
          Add Product
        </Button>
      </Box>

      {data.unreadable && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Saved inventory data could not be read, so products cannot be shown. Nothing has been
          overwritten. A backup copy of the unreadable data was kept in browser storage.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search by code or name"
            size="small"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            sx={{ minWidth: 260 }}
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
            {categoryOptions.map((c) => (
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
            label="Status"
            size="small"
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value={STATUS.ACTIVE}>Active</MenuItem>
            <MenuItem value={STATUS.INACTIVE}>Inactive</MenuItem>
          </TextField>
          <Button variant="outlined" onClick={clearFilters} disabled={!hasFilters}>
            Clear Filters
          </Button>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 1100 }}>
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length + 1} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    {hasFilters ? 'No products match the selected filters.' : 'No products found.'}
                  </TableCell>
                </TableRow>
              )}
              {pageRows.map((row) => (
                <TableRow key={row.id} hover sx={{ opacity: row.status === STATUS.INACTIVE ? 0.65 : 1 }}>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.categoryName}</TableCell>
                  <TableCell>{row.supplierName}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell align="right">{formatCurrency(row.unitCost)}</TableCell>
                  <TableCell align="right">
                    <strong>{row.availableStock}</strong>
                  </TableCell>
                  <TableCell align="right">{row.reorderLevel}</TableCell>
                  <TableCell>
                    <StockStatusChip status={row.stockStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => navigate(`/products/${row.id}`)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => navigate(`/products/${row.id}/edit`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={row.status === STATUS.ACTIVE ? 'Deactivate' : 'Activate'}>
                      <IconButton size="small" onClick={() => setConfirmTarget(row)}>
                        {row.status === STATUS.ACTIVE ? (
                          <BlockIcon fontSize="small" />
                        ) : (
                          <CheckCircleOutlineIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
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

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title={isDeactivating ? 'Deactivate product?' : 'Activate product?'}
        message={
          confirmTarget
            ? isDeactivating
              ? `"${confirmTarget.name}" will be marked Inactive. New stock transactions will be blocked, but its history is kept.`
              : `"${confirmTarget.name}" will be marked Active again.`
            : ''
        }
        confirmText={isDeactivating ? 'Deactivate' : 'Activate'}
        confirmColor={isDeactivating ? 'error' : 'primary'}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setConfirmTarget(null)}
      />
    </Box>
  );
}