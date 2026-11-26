import { matchPath } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import OutboxIcon from '@mui/icons-material/Outbox';
import TuneIcon from '@mui/icons-material/Tune';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: DashboardIcon },
  { label: 'Products', path: '/products', icon: Inventory2Icon },
  { label: 'Categories', path: '/categories', icon: CategoryIcon },
  { label: 'Suppliers', path: '/suppliers', icon: LocalShippingIcon },
  { label: 'Stock In', path: '/stock-in', icon: MoveToInboxIcon },
  { label: 'Stock Out', path: '/stock-out', icon: OutboxIcon },
  { label: 'Stock Adjustment', path: '/stock-adjustment', icon: TuneIcon },
  { label: 'Transactions', path: '/transactions', icon: HistoryIcon },
  { label: 'Reports', path: '/reports', icon: AssessmentIcon },
];

// Order matters: '/products/new' must come before '/products/:id'
const PAGE_TITLES = [
  { path: '/', title: 'Dashboard' },
  { path: '/products', title: 'Products' },
  { path: '/products/new', title: 'Add Product' },
  { path: '/products/:id', title: 'Product Details' },
  { path: '/products/:id/edit', title: 'Edit Product' },
  { path: '/categories', title: 'Categories' },
  { path: '/suppliers', title: 'Suppliers' },
  { path: '/stock-in', title: 'Stock In' },
  { path: '/stock-out', title: 'Stock Out' },
  { path: '/stock-adjustment', title: 'Stock Adjustment' },
  { path: '/transactions', title: 'Transaction History' },
  { path: '/reports', title: 'Inventory Reports' },
];

export function getPageTitle(pathname) {
  const found = PAGE_TITLES.find((r) => matchPath({ path: r.path, end: true }, pathname));
  return found ? found.title : 'Page Not Found';
}