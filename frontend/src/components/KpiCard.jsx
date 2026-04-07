import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';

export default function KpiCard({ title, value, unit, trend, trendValue, icon, loading, color = '#00C853' }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Remove;
  const trendColor = trend === 'up' ? '#00E676' : trend === 'down' ? '#FF5252' : '#78909C';

  if (loading) return (
    <Card><CardContent><Skeleton variant="text" width="60%" /><Skeleton variant="rectangular" height={48} sx={{ mt: 1 }} /></CardContent></Card>
  );

  return (
    <Card sx={{
      position: 'relative', overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}, transparent)`,
      },
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, color: 'text.primary', lineHeight: 1 }}>
              {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : (value ?? '—')}
              {unit && <Typography component="span" variant="body1" sx={{ ml: 0.5, color: 'text.secondary', fontWeight: 400 }}>{unit}</Typography>}
            </Typography>
          </Box>
          {icon && (
            <Box sx={{
              width: 48, height: 48, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: `${color}22`, color: color,
            }}>
              {icon}
            </Box>
          )}
        </Box>

        {trendValue !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
            <TrendIcon sx={{ fontSize: 16, color: trendColor }} />
            <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>
              {trendValue}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>vs last period</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
