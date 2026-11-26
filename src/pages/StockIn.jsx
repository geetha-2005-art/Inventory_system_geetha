import { useState } from 'react';
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import ProductPicker from '../components/ProductPicker';
import { useNotification } from '../hooks/useNotification';
import { getTransactionFormData, recordStockIn } from '../services/transactionService';
import { formatDateTime } from '../utils/format';

const EMPTY = { productId: '', supplierId: '', quantity: '', unitCost: '', reference: '', remarks: '' };

export default function StockIn() {
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

  // Picking a product pre-fills its default supplier and unit cost (both can be changed)
  const handleProductChange = (productId) => {
    const product = formData.products.find((p) => p.id === productId);
    const supplierActive = product && formData.suppliers.some((s) => s.id === product.supplierId);
    setValues((prev) => ({
      ...prev,
      productId,
      supplierId: supplierActive ? product.supplierId : '',
      unitCost: product ? String(product.unitCost) : '',
    }));
    clearErrors('productId', 'supplierId', 'unitCost');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');
    setLastSaved('');

    const result = recordStockIn(values);

    if (result.ok) {
      const message = `Stock In ${result.transaction.id} saved. ${result.product.code} now has ${result.transaction.balanceAfter} in stock.`;
      notify(message);
      setLastSaved(message);
      setValues(EMPTY);
      setErrors({});
      setFormData(getTransactionFormData()); // refresh the stock numbers
      return;
    }

    setErrors(result.errors || {});
    setFormError(result.message || (result.errors ? 'Please correct the highlighted fields.' : ''));
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h6" gutterBottom>
        Receive Stock from a Supplier
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
              <Alert severity="info" sx={{ gridColumn: '1 / -1' }}>
                Current stock: <strong>{selectedProduct.availableStock}</strong> {selectedProduct.unit}
                {quantityValid && (
                  <>
                    {' '}
                    → after this receipt: <strong>{selectedProduct.availableStock + Number(quantityText)}</strong>
                  </>
                )}
              </Alert>
            )}

            <TextField
              select
              label="Supplier"
              name="supplierId"
              value={values.supplierId}
              onChange={handleChange}
              error={Boolean(errors.supplierId)}
              helperText={errors.supplierId}
              required
            >
              {formData.suppliers.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Quantity Received"
              name="quantity"
              type="number"
              value={values.quantity}
              onChange={handleChange}
              error={Boolean(errors.quantity)}
              helperText={errors.quantity || 'Whole number greater than zero.'}
              required
            />
            <TextField
              label="Unit Cost (₹)"
              name="unitCost"
              type="number"
              value={values.unitCost}
              onChange={handleChange}
              error={Boolean(errors.unitCost)}
              helperText={errors.unitCost || 'Recorded on this receipt. Does not change the product master cost.'}
              required
            />
            <TextField
              label="Reference Number"
              name="reference"
              value={values.reference}
              onChange={handleChange}
              error={Boolean(errors.reference)}
              helperText={errors.reference || 'Optional (e.g. invoice or PO number).'}
            />
            <TextField
              label="Remarks"
              name="remarks"
              value={values.remarks}
              onChange={handleChange}
              error={Boolean(errors.remarks)}
              helperText={errors.remarks || 'Optional.'}
              multiline
              minRows={2}
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
              Save Stock In
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
}