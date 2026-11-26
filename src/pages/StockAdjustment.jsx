import { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import ProductPicker from '../components/ProductPicker';
import { useNotification } from '../hooks/useNotification';
import { getTransactionFormData, recordAdjustment } from '../services/transactionService';
import { formatDateTime } from '../utils/format';

const EMPTY = { productId: '', actualStock: '', reason: '' };

export default function StockAdjustment() {
  const { notify } = useNotification();
  const [formData, setFormData] = useState(getTransactionFormData);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [lastSaved, setLastSaved] = useState('');
  const [openedAt] = useState(() => formatDateTime(new Date().toISOString()));

  if (formData.status === 'unreadable') {
    return (
      <Alert severity="error">
        Saved inventory data could not be read, so stock cannot be adjusted. Nothing has been
        overwritten.
      </Alert>
    );
  }

  const selectedProduct = formData.products.find((p) => p.id === values.productId);
  const actualText = values.actualStock.trim();
  const actualValid = /^\d+$/.test(actualText);
  const difference = selectedProduct && actualValid ? Number(actualText) - selectedProduct.availableStock : null;
  const differenceText = difference === null ? '-' : difference > 0 ? `+${difference}` : String(difference);

  const clearErrors = (...names) =>
    setErrors((prev) => {
      const next = { ...prev };
      names.forEach((n) => delete next[n]);
      return next;
    });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    clearErrors(name);
  };

  const handleProductChange = (productId) => {
    setValues((prev) => ({ ...prev, productId, actualStock: '' }));
    clearErrors('productId', 'actualStock');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');
    setLastSaved('');

    const result = recordAdjustment(values);

    if (result.ok) {
      const change = result.transaction.quantityChange;
      const signed = change > 0 ? `+${change}` : String(change);
      const message = `Adjustment ${result.transaction.id} saved (${signed}). ${result.product.code} now has ${result.transaction.balanceAfter} in stock.`;
      notify(message);
      setLastSaved(message);
      setValues(EMPTY);
      setErrors({});
      setFormData(getTransactionFormData());
      return;
    }

    setErrors(result.errors || {});
    setFormError(result.message || (result.errors ? 'Please correct the highlighted fields.' : ''));
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h6" gutterBottom>
        Correct Stock to Match a Physical Count
      </Typography>

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {lastSaved && <Alert severity="success">{lastSaved}</Alert>}
          {formError && <Alert severity="error">{formError}</Alert>}
          {formData.products.length === 0 && (
            <Alert severity="warning">No active products are available. Add or activate a product first.</Alert>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <ProductPicker
                products={formData.products}
                value={values.productId}
                onChange={handleProductChange}
                error={Boolean(errors.productId)}
                helperText={errors.productId}
              />
            </Box>

            <TextField
              label="Current Stock (system)"
              value={selectedProduct ? `${selectedProduct.availableStock} ${selectedProduct.unit}` : ''}
              disabled
              helperText="Read-only."
            />
            <TextField
              label="Actual Stock (physical count)"
              name="actualStock"
              type="number"
              value={values.actualStock}
              onChange={handleChange}
              error={Boolean(errors.actualStock)}
              helperText={errors.actualStock || 'Whole number, 0 or more.'}
              required
            />
            <TextField
              label="Adjustment (calculated)"
              value={differenceText}
              disabled
              helperText="Actual stock minus current stock."
            />
            <TextField label="Adjustment Date" value={openedAt} disabled helperText="Set automatically when saved." />
            <TextField
              label="Reason"
              name="reason"
              value={values.reason}
              onChange={handleChange}
              error={Boolean(errors.reason)}
              helperText={errors.reason || 'Required (e.g. damaged, lost, count correction).'}
              multiline
              minRows={2}
              required
              sx={{ gridColumn: '1 / -1' }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              onClick={() => {
                setValues(EMPTY);
                setErrors({});
                setFormError('');
              }}
            >
              Clear
            </Button>
            <Button type="submit" variant="contained" disabled={formData.products.length === 0}>
              Save Adjustment
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
}