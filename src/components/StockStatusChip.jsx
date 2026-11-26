import { Chip } from '@mui/material';
import { STOCK_STATUS } from '../utils/constants';

const COLORS = {
  [STOCK_STATUS.IN_STOCK]: 'success',
  [STOCK_STATUS.LOW_STOCK]: 'warning',
  [STOCK_STATUS.OUT_OF_STOCK]: 'error',
};

export default function StockStatusChip({ status }) {
  return <Chip size="small" label={status} color={COLORS[status] || 'default'} />;
}