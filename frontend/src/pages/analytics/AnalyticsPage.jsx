import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, MenuItem, TextField,
  Button, Breadcrumbs, Link, CircularProgress, Alert, Divider, Chip
} from '@mui/material';
import { NavigateNext, Analytics as AnalyticsIcon } from '@mui/icons-material';
import { orgApi, placeApi, machineApi, metricApi, analyticsApi } from '../../api';
import KpiCard from '../../components/KpiCard';
import TrendLineChart from '../../components/TrendLineChart';
import BarComparison from '../../components/BarComparison';
import PieDistribution from '../../components/PieDistribution';

export default function AnalyticsPage() {
  const [orgs, setOrgs] = useState([]);
  const [places, setPlaces] = useState([]);
  const [machines, setMachines] = useState([]);
  const [metrics, setMetrics] = useState([]);

  const [selected, setSelected] = useState({ orgId: '', placeId: '', machineId: '', metricId: '', granularity: 'monthly' });
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    orgApi.getAll().then(r => setOrgs(r.data));
    metricApi.getAll().then(r => setMetrics(r.data));
  }, []);

  const handleOrgChange = async (orgId) => {
    setSelected(s => ({ ...s, orgId, placeId: '', machineId: '' }));
    setPlaces([]);
    setMachines([]);
    if (orgId) {
      placeApi.getAll(orgId).then(r => setPlaces(r.data));
    }
  };

  const handlePlaceChange = async (placeId) => {
    setSelected(s => ({ ...s, placeId, machineId: '' }));
    setMachines([]);
    if (placeId) {
      machineApi.getAll(placeId).then(r => setMachines(r.data));
    }
  };

  const handleLoad = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { metricId: selected.metricId || undefined };

      if (selected.machineId) {
        const res = await analyticsApi.getMachineAnalytics(selected.machineId, params);
        setOverview({ type: 'machine', data: res.data });
      } else if (selected.placeId) {
        const res = await analyticsApi.getPlaceAnalytics(selected.placeId, params);
        setOverview({ type: 'place', data: res.data });
      } else if (selected.orgId) {
        const res = await analyticsApi.getOrgOverview(selected.orgId, {});
        setOverview({ type: 'org', data: res.data });
      }

      if (selected.metricId) {
        const tRes = await analyticsApi.getTrends({ metricId: selected.metricId, granularity: selected.granularity });
        setTrends(tRes.data);
      }

      const aRes = await analyticsApi.getAnomalies({ metricId: selected.metricId || undefined });
      setAnomalies(aRes.data || []);
    } catch (e) {
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const kpiSummaries = overview?.data?.metricSummaries || [];
  const trendData = trends?.dataPoints?.map(p => ({ period: p.period, Total: Number(p.totalValue), Average: Number(p.avgValue) })) || [];
  const barData = overview?.data?.topPlaces?.map(p => ({
    name: p.placeName,
    Entries: p.entryCount,
    Machines: p.machineCount,
  })) || [];

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AnalyticsIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h4" fontWeight={800}>Analytics</Typography>
          <Typography variant="body2" color="text.secondary">Drill down: Organization → Place → Machine</Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={2}>
              <TextField id="a-org" select fullWidth label="Organization" size="small"
                value={selected.orgId} onChange={e => handleOrgChange(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {orgs.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField id="a-place" select fullWidth label="Place" size="small"
                value={selected.placeId} onChange={e => handlePlaceChange(e.target.value)} disabled={!selected.orgId}>
                <MenuItem value="">All Places</MenuItem>
                {places.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField id="a-machine" select fullWidth label="Machine" size="small"
                value={selected.machineId} onChange={e => setSelected(s => ({ ...s, machineId: e.target.value }))} disabled={!selected.placeId}>
                <MenuItem value="">All Machines</MenuItem>
                {machines.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField id="a-metric" select fullWidth label="Metric" size="small"
                value={selected.metricId} onChange={e => setSelected(s => ({ ...s, metricId: e.target.value }))}>
                <MenuItem value="">All Metrics</MenuItem>
                {metrics.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField id="a-granularity" select fullWidth label="Granularity" size="small"
                value={selected.granularity} onChange={e => setSelected(s => ({ ...s, granularity: e.target.value }))}>
                {['daily','weekly','monthly'].map(g => <MenuItem key={g} value={g}>{g.charAt(0).toUpperCase()+g.slice(1)}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button id="a-load-btn" variant="contained" fullWidth onClick={handleLoad} disabled={loading}>
                {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Load Analytics'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Breadcrumb drill-down */}
      {overview && (
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" onClick={() => setOverview(null)} sx={{ cursor: 'pointer' }}>All</Link>
          {overview.data.organizationName && <Typography color="primary">{overview.data.organizationName}</Typography>}
          {overview.data.placeName && <Typography color="primary">{overview.data.placeName}</Typography>}
          {overview.data.machineName && <Typography color="primary">{overview.data.machineName}</Typography>}
        </Breadcrumbs>
      )}

      {/* KPI Cards */}
      {kpiSummaries.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Metric KPIs</Typography>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {kpiSummaries.map((m, i) => (
              <Grid item xs={12} sm={6} md={3} key={m.metricName}>
                <KpiCard
                  title={`Total ${m.metricName}`}
                  value={parseFloat(m.totalValue)}
                  unit={m.metricUnit}
                  color={['#00C853','#40C4FF','#FFD740','#FF5252'][i % 4]}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Charts */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {trendData.length > 0 && (
          <Grid item xs={12} md={8}>
            <TrendLineChart
              title={`${trends?.metricName || 'Metric'} Trend (${selected.granularity})`}
              data={trendData}
              lines={['Total', 'Average']}
            />
          </Grid>
        )}
        {barData.length > 0 && (
          <Grid item xs={12} md={4}>
            <BarComparison title="Place Comparison" data={barData} bars={['Entries']} />
          </Grid>
        )}
      </Grid>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <Card sx={{ border: '1px solid rgba(255,82,82,0.3)' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: 'error.main' }}>
              ⚠️ Anomalies Detected ({anomalies.length})
            </Typography>
            {anomalies.map((a, i) => (
              <Box key={i}>
                {i > 0 && <Divider sx={{ my: 1 }} />}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{a.metricName} — {a.placeName}{a.machineName ? ` / ${a.machineName}` : ''}</Typography>
                    <Typography variant="caption" color="text.secondary">Detected: {new Date(a.detectedAt).toLocaleDateString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label={`Value: ${Number(a.value).toLocaleString()} ${a.metricUnit}`} color="error" size="small" />
                    <Chip label={`Threshold: ${Number(a.threshold).toLocaleString()}`} size="small" sx={{ bgcolor: 'rgba(255,82,82,0.1)', color: 'error.light' }} />
                  </Box>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
