import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  MenuItem, Alert, CircularProgress, Divider
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { placeApi, machineApi, metricApi, dataEntryApi } from '../../api';

export default function DataEntryPage() {
  const [places, setPlaces] = useState([]);
  const [machines, setMachines] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [form, setForm] = useState({ placeId: '', machineId: '', metricId: '', value: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    placeApi.getAll().then(r => setPlaces(r.data));
    metricApi.getAll().then(r => setMetrics(r.data));
  }, []);

  const handlePlaceChange = async (e) => {
    const placeId = e.target.value;
    setForm(f => ({ ...f, placeId, machineId: '' }));
    if (placeId) {
      machineApi.getAll(placeId).then(r => setMachines(r.data));
    } else {
      setMachines([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await dataEntryApi.submit({
        placeId: Number(form.placeId),
        machineId: form.machineId ? Number(form.machineId) : null,
        metricId: Number(form.metricId),
        value: Number(form.value),
        notes: form.notes,
      });
      setSuccess('Data entry submitted successfully! It is now pending review.');
      setForm({ placeId: '', machineId: '', metricId: '', value: '', notes: '' });
      setMachines([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="animate-fade-in">
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Submit Data</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter sustainability measurements for review and approval.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>New Data Entry</Typography>

              {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="de-place"
                      select fullWidth label="Place *"
                      value={form.placeId}
                      onChange={handlePlaceChange}
                      required
                    >
                      <MenuItem value="">Select Place</MenuItem>
                      {places.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="de-machine"
                      select fullWidth label="Machine (Optional)"
                      value={form.machineId}
                      onChange={e => setForm(f => ({ ...f, machineId: e.target.value }))}
                      disabled={!form.placeId}
                    >
                      <MenuItem value="">None</MenuItem>
                      {machines.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="de-metric"
                      select fullWidth label="Metric *"
                      value={form.metricId}
                      onChange={e => setForm(f => ({ ...f, metricId: e.target.value }))}
                      required
                    >
                      <MenuItem value="">Select Metric</MenuItem>
                      {metrics.map(m => <MenuItem key={m.id} value={m.id}>{m.name} ({m.unit})</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="de-value"
                      fullWidth label="Value *"
                      type="number"
                      inputProps={{ step: 'any', min: 0 }}
                      value={form.value}
                      onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      id="de-notes"
                      fullWidth label="Notes (Optional)"
                      multiline rows={3}
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      id="de-submit-btn"
                      type="submit" variant="contained" size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Send />}
                      sx={{ px: 4 }}
                    >
                      {loading ? 'Submitting...' : 'Submit for Review'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card className="glass" sx={{ height: '100%', background: 'transparent' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Submission Guide</Typography>
              <Divider sx={{ mb: 2 }} />
              {[
                { step: '1', text: 'Select the place (factory/office) where data was recorded.' },
                { step: '2', text: 'Optionally select the machine or system measured.' },
                { step: '3', text: 'Choose the metric type (Energy, Emissions, Water, etc.).' },
                { step: '4', text: 'Enter the measured value in the correct unit shown.' },
                { step: '5', text: 'Add notes for context if needed, then submit.' },
              ].map(item => (
                <Box key={item.step} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: '50%',
                    bgcolor: 'rgba(0,200,83,0.15)', color: 'primary.main',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {item.step}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ pt: 0.4 }}>{item.text}</Typography>
                </Box>
              ))}
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2, fontSize: '0.8rem' }}>
                Submitted data is marked <strong>Pending</strong> until reviewed by an Analyst or Admin.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
