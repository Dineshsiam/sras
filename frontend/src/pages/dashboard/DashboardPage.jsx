import { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Chip, Divider,
  LinearProgress, Alert
} from '@mui/material';
import {
  ElectricBolt, Co2, Water, Recycling, PendingActions,
  CheckCircle, Cancel, Assessment
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, orgApi } from '../../api';
import KpiCard from '../../components/KpiCard';
import TrendLineChart from '../../components/TrendLineChart';
import PieDistribution from '../../components/PieDistribution';

const METRIC_ICONS = {
  Energy: <ElectricBolt />, Emissions: <Co2 />, Water: <Water />, Waste: <Recycling />,
};
const METRIC_COLORS = ['#00C853', '#40C4FF', '#FFD740', '#FF5252', '#CE93D8'];

export default function DashboardPage() {
  const { user, isEmployee } = useAuth();
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (user?.organizationId) {
          const res = await orgApi.getAll();
          const orgs = res.data;
          if (orgs.length > 0) {
            const ovRes = await analyticsApi.getOrgOverview(orgs[0].id, {});
            setOverview(ovRes.data);
          }
        }
      } catch (e) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const statusPieData = overview ? [
    { name: 'Approved', value: overview.approvedEntries },
    { name: 'Pending',  value: overview.pendingEntries },
    { name: 'Rejected', value: overview.rejectedEntries },
  ] : [];

  return (
    <Box className="animate-fade-in">
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="h4" fontWeight={800} sx={{ background: 'linear-gradient(280deg, #F1F8F1, #81C784)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {overview && (
            <Chip label={overview.organizationName} size="small" sx={{ ml: 1.5, bgcolor: 'rgba(0,200,83,0.1)', color: 'primary.main', fontWeight: 700 }} />
          )}
        </Typography>
      </Box>

      {loading && <LinearProgress color="primary" sx={{ mb: 2, borderRadius: 1 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Status KPI Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Entries"
            value={overview?.totalEntries}
            icon={<Assessment />}
            loading={loading}
            color="#00C853"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Pending Review"
            value={overview?.pendingEntries}
            icon={<PendingActions />}
            loading={loading}
            color="#FFD740"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Approved"
            value={overview?.approvedEntries}
            icon={<CheckCircle />}
            loading={loading}
            color="#00E676"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Rejected"
            value={overview?.rejectedEntries}
            icon={<Cancel />}
            loading={loading}
            color="#FF5252"
          />
        </Grid>
      </Grid>

      {/* Metric KPI Row */}
      {overview?.metricSummaries?.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Metric Overview
          </Typography>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {overview.metricSummaries.slice(0, 4).map((m, i) => (
              <Grid item xs={12} sm={6} md={3} key={m.metricName}>
                <KpiCard
                  title={m.metricName}
                  value={parseFloat(m.totalValue)}
                  unit={m.metricUnit}
                  icon={METRIC_ICONS[m.metricName] || <ElectricBolt />}
                  color={METRIC_COLORS[i % METRIC_COLORS.length]}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Charts Row */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <TrendLineChart
            title="Submission Trends (Monthly)"
            data={[]}
            lines={['total']}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PieDistribution
            title="Entry Status Distribution"
            data={statusPieData}
          />
        </Grid>

        {/* Top Places */}
        {overview?.topPlaces?.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Place-Level Summary
                </Typography>
                {overview.topPlaces.map((place, i) => (
                  <Box key={place.placeId}>
                    {i > 0 && <Divider sx={{ my: 1.5, borderColor: 'divider' }} />}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{place.placeName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {place.location} • {place.machineCount} machines • {place.entryCount} entries
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {place.metricSummaries?.slice(0, 3).map(m => (
                          <Chip
                            key={m.metricName}
                            label={`${m.metricName}: ${Number(m.totalValue).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${m.metricUnit}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(0,200,83,0.08)', color: 'primary.light', fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
