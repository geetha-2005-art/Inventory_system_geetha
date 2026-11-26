import { Box, Paper, Typography } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatNumber } from '../utils/format';

const COLORS = [
  '#2563eb',
  '#0ea5e9',
  '#16a34a',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#64748b',
];

// data: [{ name: 'Laptops', units: 21 }, ...]
export default function StockByCategoryChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.units, 0);
  const percent = (units) => (total > 0 ? Math.round((units / total) * 1000) / 10 : 0);

  return (
    <Paper sx={{ p: 2.5, minWidth: 0 }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Stock by Category
      </Typography>
      <Typography variant="caption" sx={{ mb: 1 }}>
        Share of total units in stock
      </Typography>

      {total === 0 ? (
        <Typography align="center" sx={{ py: 6, color: 'text.secondary' }}>
          No stock data to chart yet.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 3,
            mt: 1,
          }}
        >
          {/* Donut with the total in the centre */}
          <Box sx={{ position: 'relative', width: 240, height: 240, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="units"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={108}
                  paddingAngle={data.length > 1 ? 2 : 0}
                  stroke="none"
                >
                  {data.map((item, index) => (
                    <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${formatNumber(value)} units (${percent(value)}%)`, name]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="h5">{formatNumber(total)}</Typography>
              <Typography variant="caption" sx={{ textAlign: 'center' }}>
                total units
              </Typography>
            </Box>
          </Box>

          {/* Legend */}
          <Box sx={{ flexGrow: 1, width: '100%', minWidth: 0 }}>
            {data.map((item, index) => (
              <Box
                key={item.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1,
                  borderBottom: index === data.length - 1 ? 'none' : '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    flexShrink: 0,
                    bgcolor: COLORS[index % COLORS.length],
                  }}
                />
                <Typography variant="body2" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatNumber(item.units)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ width: 52, textAlign: 'right', color: 'text.secondary' }}
                >
                  {percent(item.units)}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}