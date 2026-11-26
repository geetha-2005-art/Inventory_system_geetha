import { useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField,
} from '@mui/material';
import { STATUS } from '../utils/constants';
import { addCategory, updateCategory } from '../services/categoryService';

const EMPTY = { code: '', name: '', description: '', status: STATUS.ACTIVE };

// category = null  → Add mode,   category = {...} → Edit mode
export default function CategoryDialog({ category, onClose, onSaved }) {
  const isEdit = Boolean(category);

  const [values, setValues] = useState(
    isEdit
      ? {
          code: category.code,
          name: category.name,
          description: category.description || '',
          status: category.status,
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
      delete next[name]; // clear the error as soon as the user edits that field
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');

    const result = isEdit ? updateCategory(category.id, values) : addCategory(values);

    if (result.ok) {
      onSaved(isEdit ? 'Category updated successfully.' : 'Category added successfully.');
      return;
    }
    setErrors(result.errors || {});
    setFormError(result.message || '');
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Category Code"
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
              label="Category Name"
              name="name"
              value={values.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
              required
              fullWidth
            />
            <TextField
              label="Description"
              name="description"
              value={values.description}
              onChange={handleChange}
              error={Boolean(errors.description)}
              helperText={errors.description}
              multiline
              minRows={2}
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