import { useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField,
} from '@mui/material';
import { STATUS } from '../utils/constants';
import { addSupplier, updateSupplier } from '../services/supplierService';

const EMPTY = { code: '', name: '', contactPerson: '', email: '', phone: '', status: STATUS.ACTIVE };

export default function SupplierDialog({ supplier, onClose, onSaved }) {
  const isEdit = Boolean(supplier);

  const [values, setValues] = useState(
    isEdit
      ? {
          code: supplier.code,
          name: supplier.name,
          contactPerson: supplier.contactPerson || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          status: supplier.status,
        }
      : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

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
    setFormError('');

    const result = isEdit ? updateSupplier(supplier.id, values) : addSupplier(values);

    if (result.ok) {
      onSaved(isEdit ? 'Supplier updated successfully.' : 'Supplier added successfully.');
      return;
    }
    setErrors(result.errors || {});
    setFormError(result.message || '');
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>{isEdit ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Supplier Code"
              name="code"
              value={values.code}
              onChange={handleChange}
              error={Boolean(errors.code)}
              helperText={errors.code || (isEdit ? 'Code cannot be changed after creation.' : '')}
              disabled={isEdit}
              required
              fullWidth
            />
            <TextField
              label="Supplier Name"
              name="name"
              value={values.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
              required
              fullWidth
            />
            <TextField
              label="Contact Person"
              name="contactPerson"
              value={values.contactPerson}
              onChange={handleChange}
              error={Boolean(errors.contactPerson)}
              helperText={errors.contactPerson}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
              fullWidth
            />
            <TextField
              label="Phone"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              fullWidth
            />
            <TextField
              select
              label="Status"
              name="status"
              value={values.status}
              onChange={handleChange}
              error={Boolean(errors.status)}
              helperText={errors.status}
              fullWidth
            >
              <MenuItem value={STATUS.ACTIVE}>Active</MenuItem>
              <MenuItem value={STATUS.INACTIVE}>Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}