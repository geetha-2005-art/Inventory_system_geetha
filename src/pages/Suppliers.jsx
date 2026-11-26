import { useState } from 'react';
import {
  Alert, Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import SupplierDialog from '../components/SupplierDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusChip from '../components/StockStatusChip';
import { useNotification } from '../hooks/useNotification';
import { getSuppliers, setSupplierStatus } from '../services/supplierService';
import { STATUS } from '../utils/constants';

export default function Suppliers() {
  const { notify } = useNotification();
  const [result, setResult] = useState(getSuppliers);
  const [dialog, setDialog] = useState({ open: false, supplier: null });
  const [confirmTarget, setConfirmTarget] = useState(null);

  const unreadable = result.status === 'corrupted' || result.status === 'error';
  const suppliers = [...result.data].sort((a, b) => a.code.localeCompare(b.code));
  const isDeactivating = confirmTarget?.status === STATUS.ACTIVE;

  const refresh = () => setResult(getSuppliers());
  const openAdd = () => setDialog({ open: true, supplier: null });
  const openEdit = (supplier) => setDialog({ open: true, supplier });
  const closeDialog = () => setDialog({ open: false, supplier: null });

  const handleSaved = (message) => {
    closeDialog();
    refresh();
    notify(message);
  };

  const handleConfirmStatusChange = () => {
    const target = confirmTarget;
    const newStatus = target.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
    const outcome = setSupplierStatus(target.id, newStatus);
    setConfirmTarget(null);

    if (outcome.ok) {
      refresh();
      notify(`Supplier "${target.name}" ${newStatus === STATUS.ACTIVE ? 'activated' : 'deactivated'}.`);
    } else {
      notify(outcome.message, 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography color="text.secondary">
          Inactive suppliers cannot be selected for new products or new stock receipts.
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} disabled={unreadable} sx={{ flexShrink: 0 }}>
          Add Supplier
        </Button>
      </Box>

      {unreadable && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Saved supplier data could not be read. Nothing has been overwritten. A backup copy of the
          unreadable data was kept in browser storage.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No suppliers found.
                </TableCell>
              </TableRow>
            )}
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id} hover>
                <TableCell>{supplier.code}</TableCell>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.contactPerson || '-'}</TableCell>
                <TableCell>{supplier.email || '-'}</TableCell>
                <TableCell>{supplier.phone || '-'}</TableCell>
                <TableCell>
                  <StatusChip status={supplier.status} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(supplier)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={supplier.status === STATUS.ACTIVE ? 'Deactivate' : 'Activate'}>
                    <IconButton size="small" onClick={() => setConfirmTarget(supplier)}>
                      {supplier.status === STATUS.ACTIVE ? (
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
        <SupplierDialog supplier={dialog.supplier} onClose={closeDialog} onSaved={handleSaved} />
      )}

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title={isDeactivating ? 'Deactivate supplier?' : 'Activate supplier?'}
        message={
          confirmTarget
            ? isDeactivating
              ? `"${confirmTarget.name}" will be marked Inactive and can no longer be chosen for new products or receipts.`
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