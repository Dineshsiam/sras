import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

const COLORS = ['#00C853', '#40C4FF', '#FFD740', '#FF5252', '#CE93D8', '#80DEEA'];

export default function PieDistribution({ data = [], title, height = 300 }) {
  return (
    <Card>
      <CardContent>
        {title && (
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            {title}
          </Typography>
        )}
        {data.length === 0 ? (
          <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">No data available</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="75%"
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1A231A', border: '1px solid rgba(0,200,83,0.2)', borderRadius: 8 }}
                formatter={(value) => [Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 }), '']}
              />
              <Legend
                iconType="circle"
                formatter={(value) => <span style={{ color: '#81C784', fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
