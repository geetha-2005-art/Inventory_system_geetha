import { Chip } from '@mui/material';
import { STATUS } from '../utils/constants';

export default function StatusChip({ status }) {
  const active = status === STATUS.ACTIVE;
  return (
    <Chip
      size="small"
      label={status}
      color={active ? 'success' : 'default'}
      variant={active ? 'filled' : 'outlined'}
    />
  );
}