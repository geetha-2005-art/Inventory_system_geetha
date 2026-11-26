import { useState } from 'react';
import {
  Alert, Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import CategoryDialog from '../components/CategoryDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusChip from '../components/StockStatusChip';
import { useNotification } from '../hooks/useNotification';
import { getCategories, setCategoryStatus } from '../services/categoryService';
import { STATUS } from '../utils/constants';

export default function Categories() {
  const { notify } = useNotification();
  const [result, setResult] = useState(getCategories);
  const [dialog, setDialog] = useState({ open: false, category: null });
  const [confirmTarget, setConfirmTarget] = useState(null);

  const unreadable = result.status === 'corrupted' || result.status === 'error';
  const categories = [...result.data].sort((a, b) => a.code.localeCompare(b.code));
  const isDeactivating = confirmTarget?.status === STATUS.ACTIVE;

  const refresh = () => setResult(getCategories());
  const openAdd = () => setDialog({ open: true, category: null });
  const openEdit = (category) => setDialog({ open: true, category });
  const closeDialog = () => setDialog({ open: false, category: null });

  const handleSaved = (message) => {
    closeDialog();
    refresh();
    notify(message);
  };

  const handleConfirmStatusChange = () => {
    const target = confirmTarget;
    const newStatus = target.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
    const outcome = setCategoryStatus(target.id, newStatus);
    setConfirmTarget(null);

    if (outcome.ok) {
      refresh();
      notify(`Category "${target.name}" ${newStatus === STATUS.ACTIVE ? 'activated' : 'deactivated'}.`);
    } else {
      notify(outcome.message, 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography color="text.secondary">
          Categories are deactivated, never deleted. A category used by an active product cannot be deactivated.
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} disabled={unreadable} sx={{ flexShrink: 0 }}>
          Add Category
        </Button>
      </Box>

      {unreadable && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Saved category data could not be read. Nothing has been overwritten. A backup copy of the
          unreadable data was kept in browser storage.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No categories found.
                </TableCell>
              </TableRow>
            )}
            {categories.map((category) => (
              <TableRow key={category.id} hover>
                <TableCell>{category.code}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description || '-'}</TableCell>
                <TableCell>
                  <StatusChip status={category.status} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(category)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={category.status === STATUS.ACTIVE ? 'Deactivate' : 'Activate'}>
                    <IconButton size="small" onClick={() => setConfirmTarget(category)}>
                      {category.status === STATUS.ACTIVE ? (
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

      {dialog.open && (
        <CategoryDialog category={dialog.category} onClose={closeDialog} onSaved={handleSaved} />
      )}

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title={isDeactivating ? 'Deactivate category?' : 'Activate category?'}
        message={
          confirmTarget
            ? isDeactivating
              ? `"${confirmTarget.name}" will be marked Inactive. Existing records are kept.`
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