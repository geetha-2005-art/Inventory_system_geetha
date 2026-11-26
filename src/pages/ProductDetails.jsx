import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ConfirmDialog from '../components/ConfirmDialog';
import ProductNotFound from '../components/ProductNotFound';
import QuantityChange from '../components/QuantityChange';
import StatusChip from '../components/StatusChip';
import StockStatusChip from '../components/StockStatusChip';
import { useNotification } from '../hooks/useNotification';
import { getProductDetails, setProductStatus } from '../services/productService';
import { STATUS } from '../utils/constants';
import { formatCurrency, formatDateTime } from '../utils/format';

function InfoItem({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography>{value}</Typography>
    </Box>
  );
}

function StatCard({ label, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ mt: 0.5 }}>{children}</Box>
    </Paper>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  return <ProductDetailsContent key={id} id={id} />;
}

function ProductDetailsContent({ id }) {
  const { notify } = useNotification();
  const [details, setDetails] = useState(() => getProductDetails(id));
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (details.status === 'unreadable') {
    return (
      <Alert severity="error">
        Saved inventory data could not be read. Nothing has been overwritten.
      </Alert>
    );
  }
  if (details.status === 'notfound') return <ProductNotFound />;

  const { product, latestTransactions, totalTransactions } = details;
  const isActive = product.status === STATUS.ACTIVE;

  const handleToggleStatus = () => {
    const newStatus = isActive ? STATUS.INACTIVE : STATUS.ACTIVE;
    const outcome = setProductStatus(product.id, newStatus);
    setConfirmOpen(false);

    if (outcome.ok) {
      setDetails(getProductDetails(id));
      notify(`Product "${product.name}" ${newStatus === STATUS.ACTIVE ? 'activated' : 'deactivated'}.`);
    } else {
      notify(outcome.message, 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 1, mb: 2 }}>
        <Button component={Link} to="/products" startIcon={<ArrowBackIcon />}>
          Back to Products
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component={Link} to={`/products/${product.id}/edit`} variant="outlined" startIcon={<EditIcon />}>
            Edit
          </Button>
          <Button
            variant="outlined"
            color={isActive ? 'error' : 'primary'}
            onClick={() => setConfirmOpen(true)}
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </Box>
      </Box>

      {!isActive && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This product is inactive. New stock transactions are not allowed, but its history is kept.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
          <Typography variant="h5">{product.name}</Typography>
          <StatusChip status={product.status} />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          <StatCard label="Available Stock">
            <Typography variant="h5">
              {product.availableStock} <Typography component="span" color="text.secondary">{product.unit}</Typography>
            </Typography>
          </StatCard>
          <StatCard label="Inventory Value">
            <Typography variant="h5">{formatCurrency(product.inventoryValue)}</Typography>
          </StatCard>
          <StatCard label="Stock Status">
            <StockStatusChip status={product.stockStatus} />
          </StatCard>
          <StatCard label="Reorder Level">
            <Typography variant="h5">{product.reorderLevel}</Typography>
          </StatCard>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          <InfoItem label="Product Code" value={product.code} />
          <InfoItem label="Category" value={product.categoryName} />
          <InfoItem label="Default Supplier" value={product.supplierName} />
          <InfoItem label="Unit of Measure" value={product.unit} />
          <InfoItem label="Unit Cost" value={formatCurrency(product.unitCost)} />
          <InfoItem label="Status" value={product.status} />
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography variant="caption" color="text.secondary">
              Description
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{product.description || '-'}</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6">
            Latest Transactions{' '}
            <Typography component="span" variant="body2" color="text.secondary">
              (showing {latestTransactions.length} of {totalTransactions})
            </Typography>
          </Typography>
          <Button component={Link} to={`/transactions?product=${product.id}`} variant="outlined" size="small">
            View Full History
          </Button>
        </Box>

        <TableContainer>
          <Table size="small" sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Quantity Change</TableCell>
                <TableCell align="right">Balance After</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {latestTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No transactions recorded for this product yet.
                  </TableCell>
                </TableRow>
              )}
              {latestTransactions.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{formatDateTime(t.date)}</TableCell>
                  <TableCell>{t.id}</TableCell>
                  <TableCell>{t.type}</TableCell>
                  <TableCell align="right">
                    <QuantityChange value={t.quantityChange} />
                  </TableCell>
                  <TableCell align="right">{t.balanceAfter}</TableCell>
                  <TableCell>{t.reference || '-'}</TableCell>
                  <TableCell>{t.remarks || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ConfirmDialog
        open={confirmOpen}
        title={isActive ? 'Deactivate product?' : 'Activate product?'}
        message={
          isActive
            ? `"${product.name}" will be marked Inactive. New stock transactions will be blocked, but its history is kept.`
            : `"${product.name}" will be marked Active again.`
        }
        confirmText={isActive ? 'Deactivate' : 'Activate'}
        confirmColor={isActive ? 'error' : 'primary'}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
}