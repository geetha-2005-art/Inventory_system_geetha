import { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import ProductPicker from '../components/ProductPicker';
import { useNotification } from '../hooks/useNotification';
import { getTransactionFormData, recordStockOut } from '../services/transactionService';
import { formatDateTime } from '../utils/format';

const EMPTY = { productId: '', quantity: '', issuedTo: '', department: '', purpose: '' };

export default function StockOut() {
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
        Saved inventory data could not be read, so stock cannot be recorded. Nothing has been
        overwritten.
      </Alert>
    );
  }

  const selectedProduct = formData.products.find((p) => p.id === values.productId);
  const quantityText = values.quantity.trim();
  const quantityValid = /^\d+$/.test(quantityText) && Number(quantityText) > 0;
  const exceedsStock = selectedProduct && quantityValid && Number(quantityText) > selectedProduct.availableStock;

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
    setValues((prev) => ({ ...prev, productId }));
    clearErrors('productId', 'quantity');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');
    setLastSaved('');

    const result = recordStockOut(values);

    if (result.ok) {
      const message = `Stock Out ${result.transaction.id} saved. ${result.product.code} now has ${result.transaction.balanceAfter} in stock.`;
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
        Issue Stock to an Employee or Department
      </Typography>

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {lastSaved && <Alert severity="success">{lastSaved}</Alert>}
          {formError && <Alert severity="error">{formError}</Alert>}
          {formData.products.length === 0 && (
            <Alert severity="warning">No active products are available. Add or activate a product first.</Alert>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField label="Transaction Reference" value="Auto-generated on save" disabled />
            <TextField label="Transaction Date" value={openedAt} disabled helperText="Set automatically when saved." />

            <Box sx={{ gridColumn: '1 / -1' }}>
              <ProductPicker
                products={formData.products}
                value={values.productId}
                onChange={handleProductChange}
                error={Boolean(errors.productId)}
                helperText={errors.productId}
              />
            </Box>

            {selectedProduct && (
              <Alert severity={exceedsStock ? 'warning' : 'info'} sx={{ gridColumn: '1 / -1' }}>
                Available stock: <strong>{selectedProduct.availableStock}</strong> {selectedProduct.unit}
                {exceedsStock
                  ? '. The quantity entered is more than what is available.'
                  : quantityValid && (
                      <>
                        {' '}
                        → after this issue: <strong>{selectedProduct.availableStock - Number(quantityText)}</strong>
                      </>
                    )}
              </Alert>
            )}

            <TextField
              label="Quantity Issued"
              name="quantity"
              type="number"
              value={values.quantity}
              onChange={handleChange}
              error={Boolean(errors.quantity)}
              helperText={errors.quantity || 'Whole number greater than zero.'}
              required
              sx={{ gridColumn: '1 / -1' }}
            />
            <TextField
              label="Issued To"
              name="issuedTo"
              value={values.issuedTo}
              onChange={handleChange}
              error={Boolean(errors.issuedTo)}
              helperText={errors.issuedTo || 'Employee name.'}
              required
            />
            <TextField
              label="Department"
              name="department"
              value={values.department}
              onChange={handleChange}
              error={Boolean(errors.department)}
              helperText={errors.department}
              required
            />
            <TextField
              label="Purpose"
              name="purpose"
              value={values.purpose}
              onChange={handleChange}
              error={Boolean(errors.purpose)}
              helperText={errors.purpose || 'Why is this stock being issued?'}
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
              Save Stock Out
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
}