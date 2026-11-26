import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Box, Button, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography,
} from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LayersIcon from '@mui/icons-material/Layers';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import KpiCard from '../components/KpiCard';
import StockByCategoryChart from '../components/StockByCategoryChart';
import StockStatusChip from '../components/StockStatusChip';
import { getDashboardData } from '../services/dashboardService';
import { formatCurrency, formatNumber } from '../utils/format';

const MAX_LIST_ROWS = 8;

export default function Dashboard() {
  const [data] = useState(getDashboardData);

  if (data.unreadable) {
    return (
      <Alert severity="error">
        Saved inventory data could not be read, so the dashboard cannot be shown. Nothing has been
        overwritten. A backup copy of the unreadable data was kept in browser storage.
      </Alert>
    );
  }

  const shownRows = data.replenishment.slice(0, MAX_LIST_ROWS);

  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Overview of active inventory. Figures update as soon as stock is recorded.
      </Typography>

      {/* KPI cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <KpiCard
          label="Total Products"
          value={formatNumber(data.totalProducts)}
          caption="Active products"
          icon={Inventory2Icon}
          color="primary"
        />
        <KpiCard
          label="Total Stock Units"
          value={formatNumber(data.totalUnits)}
          caption="Available quantity, active products"
          icon={LayersIcon}
          color="info"
        />
        <KpiCard
          label="Low Stock Products"
          value={formatNumber(data.lowStockCount)}
          caption="At or below reorder level, not zero"
          icon={WarningAmberIcon}
          color="warning"
        />
        <KpiCard
          label="Out of Stock"
          value={formatNumber(data.outOfStockCount)}
          caption="Products with zero quantity"
          icon={RemoveShoppingCartIcon}
          color="error"
        />
        <KpiCard
          label="Inventory Value"
          value={formatCurrency(data.inventoryValue)}
          caption="Available quantity × unit cost"
          icon={CurrencyRupeeIcon}
          color="success"
        />
        <KpiCard
          label="Today's Transactions"
          value={formatNumber(data.todayTotal)}
          caption={`${data.receipts} receipts · ${data.issues} issues · ${data.adjustments} adjustments`}
          icon={SwapHorizIcon}
          color="primary"
        />
      </Box>

      {/* Chart + replenishment list */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
        <StockByCategoryChart data={data.categoryStock} />

        <Paper sx={{ p: 2.5, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
              mb: 1.5,
            }}
          >
            <Box>
              <Typography variant="h6">Products Requiring Replenishment</Typography>
              <Typography variant="caption">Out of stock first, then largest shortfall</Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/reports?report=low-stock"
              size="small"
              variant="outlined"
            >
              Low Stock Report
            </Button>
          </Box>

          {data.replenishment.length === 0 ? (
            <Alert severity="success" sx={{ mt: 1 }}>
              All active products are above their reorder level.
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="right">Reorder Level</TableCell>
                      <TableCell align="right">Shortfall</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shownRows.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>
                          <Link
                            component={RouterLink}
                            to={`/products/${p.id}`}
                            underline="hover"
                            sx={{ fontWeight: 600 }}
                          >
                            {p.code}
                          </Link>
                          <Typography variant="caption">{p.name}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {p.availableStock}
                        </TableCell>
                        <TableCell align="right">{p.reorderLevel}</TableCell>
                        <TableCell align="right">{p.shortfall}</TableCell>
                        <TableCell>
                          <StockStatusChip status={p.stockStatus} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" sx={{ mt: 1.5 }}>
                Showing {shownRows.length} of {data.replenishment.length} products. The full list is in
                the Low Stock Report.
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}