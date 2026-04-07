import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function BarComparison({ data = [], title, bars = [], height = 300 }) {
  const COLORS = ['#00C853', '#40C4FF', '#FFD740', '#FF5252'];

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
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#81C784', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#81C784', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1A231A', border: '1px solid rgba(0,200,83,0.2)', borderRadius: 8 }}
                labelStyle={{ color: '#E8F5E9', fontWeight: 700 }}
              />
              <Legend />
              {bars.map((key, i) => (
                <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
