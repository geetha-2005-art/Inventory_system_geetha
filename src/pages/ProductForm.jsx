import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import ProductNotFound from '../components/ProductNotFound';
import { useNotification } from '../hooks/useNotification';
import { addProduct, getProductFormData, updateProduct } from '../services/productService';
import { STATUS, UNITS } from '../utils/constants';

const EMPTY_VALUES = {
  code: '',
  name: '',
  categoryId: '',
  supplierId: '',
  description: '',
  unit: '',
  unitCost: '',
  openingStock: '0',
  reorderLevel: '',
  status: STATUS.ACTIVE,
};

function toFormValues(product, openingStock) {
  return {
    code: product.code,
    name: product.name,
    categoryId: product.categoryId,
    supplierId: product.supplierId,
    description: product.description || '',
    unit: product.unit,
    unitCost: String(product.unitCost),
    openingStock: String(openingStock),
    reorderLevel: String(product.reorderLevel),
    status: product.status,
  };
}

// The key makes React build a fresh form when switching between Add and Edit
export default function ProductForm() {
  const { id } = useParams();
  return <ProductFormContent key={id ?? 'new'} id={id} />;
}

function ProductFormContent({ id }) {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const isEdit = Boolean(id);

  const [formData] = useState(() => getProductFormData(id));
  const [values, setValues] = useState(() =>
    formData.product ? toFormValues(formData.product, formData.openingStock) : EMPTY_VALUES
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const submitted = useRef(false); // blocks double submission

  if (formData.status === 'unreadable') {
    return (
      <Alert severity="error">
        Saved inventory data could not be read, so this form cannot be used. Nothing has been
        overwritten.
      </Alert>
    );
  }
  if (formData.status === 'notfound') return <ProductNotFound />;

  // Active records, plus the product's current choice if it has since become inactive
  const categoryOptions = formData.categories
    .filter((c) => c.status === STATUS.ACTIVE || c.id === formData.product?.categoryId)
    .sort((a, b) => a.name.localeCompare(b.name));
  const supplierOptions = formData.suppliers
    .filter((s) => s.status === STATUS.ACTIVE || s.id === formData.product?.supplierId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitted.current) return;
    setFormError('');

    const result = isEdit ? updateProduct(id, values) : addProduct(values);

    if (result.ok) {
      submitted.current = true;
      notify(isEdit ? 'Product updated successfully.' : 'Product added successfully.');
      navigate(isEdit ? `/products/${id}` : '/products');
      return;
    }

    setErrors(result.errors || {});
    setFormError(result.message || (result.errors ? 'Please correct the highlighted fields.' : ''));
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 900 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? `Edit Product: ${formData.product.code}` : 'Add New Product'}
      </Typography>

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Product Code"
              name="code"
              value={values.code}
              onChange={handleChange}
              error={Boolean(errors.code)}
              helperText={errors.code || (isEdit ? 'Code cannot be changed after creation.' : 'Unique, max 20 characters.')}
              disabled={isEdit}
              required
            />
            <TextField
              label="Product Name"
              name="name"
              value={values.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
              required
            />
            <TextField
              select
              label="Category"
              name="categoryId"
              value={values.categoryId}
              onChange={handleChange}
              error={Boolean(errors.categoryId)}
              helperText={errors.categoryId}
              required
            >
              {categoryOptions.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                  {c.status === STATUS.INACTIVE ? ' (inactive)' : ''}
                </MenuItem>
              ))}
            </TextField>
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
              {supplierOptions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                  {s.status === STATUS.INACTIVE ? ' (inactive)' : ''}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Unit of Measure"
              name="unit"
              value={values.unit}
              onChange={handleChange}
              error={Boolean(errors.unit)}
              helperText={errors.unit}
              required
            >
              {UNITS.map((u) => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Unit Cost (₹)"
              name="unitCost"
              type="number"
              value={values.unitCost}
              onChange={handleChange}
              error={Boolean(errors.unitCost)}
              helperText={errors.unitCost || 'Must be greater than zero.'}
              required
            />
            <TextField
              label="Opening Stock"
              name="openingStock"
              type="number"
              value={values.openingStock}
              onChange={handleChange}
              error={Boolean(errors.openingStock)}
              helperText={
                errors.openingStock ||
                (isEdit
                  ? 'Cannot be changed. Use Stock In, Stock Out or Stock Adjustment.'
                  : 'Whole number, 0 or more. Set only at creation.')
              }
              disabled={isEdit}
              required={!isEdit}
            />
            <TextField
              label="Reorder Level"
              name="reorderLevel"
              type="number"
              value={values.reorderLevel}
              onChange={handleChange}
              error={Boolean(errors.reorderLevel)}
              helperText={errors.reorderLevel || 'Whole number, 0 or more.'}
              required
            />
            <TextField
              select
              label="Status"
              name="status"
              value={values.status}
              onChange={handleChange}
              error={Boolean(errors.status)}
              helperText={errors.status}
            >
              <MenuItem value={STATUS.ACTIVE}>Active</MenuItem>
              <MenuItem value={STATUS.INACTIVE}>Inactive</MenuItem>
            </TextField>
            <TextField
              label="Description"
              name="description"
              value={values.description}
              onChange={handleChange}
              error={Boolean(errors.description)}
              helperText={errors.description || `${values.description.length}/500`}
              multiline
              minRows={3}
              sx={{ gridColumn: '1 / -1' }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button component={Link} to={isEdit ? `/products/${id}` : '/products'}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {isEdit ? 'Update Product' : 'Save Product'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
}