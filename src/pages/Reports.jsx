import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Paper, Tab, Tabs } from '@mui/material';
import { getReportData } from '../services/reportService';
import CurrentStockReport from './reportViews/CurrentStockReport';
import StockMovementReport from './reportViews/StockMovementReport';
import LowStockReport from './reportViews/LowStockReport';

const REPORTS = [
  { value: 'current-stock', label: 'Current Stock' },
  { value: 'movement', label: 'Stock Movement' },
  { value: 'low-stock', label: 'Low Stock' },
];

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data] = useState(getReportData);

  // The selected report lives in the URL: /reports?report=low-stock
  const requested = searchParams.get('report');
  const report = REPORTS.some((r) => r.value === requested) ? requested : 'current-stock';

  if (data.unreadable) {
    return (
      <Alert severity="error">
        Saved inventory data could not be read, so reports cannot be shown. Nothing has been
        overwritten. A backup copy of the unreadable data was kept in browser storage.
      </Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={report}
          onChange={(_event, value) => setSearchParams({ report: value })}
          variant="scrollable"
          scrollButtons="auto"
        >
          {REPORTS.map((r) => (
            <Tab key={r.value} value={r.value} label={r.label} />
          ))}
        </Tabs>
      </Paper>

      {report === 'current-stock' && <CurrentStockReport data={data} />}
      {report === 'movement' && <StockMovementReport data={data} />}
      {report === 'low-stock' && <LowStockReport data={data} />}
    </Box>
  );
}