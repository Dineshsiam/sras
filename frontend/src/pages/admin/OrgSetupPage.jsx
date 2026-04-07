import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Tooltip, Alert, CircularProgress, Chip
} from '@mui/material';
import { Add, Edit, Delete, Business, LocationOn, Memory, BarChart } from '@mui/icons-material';
import { orgApi, placeApi, machineApi, metricApi } from '../../api';

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function OrgSetupPage() {
  const [tab, setTab] = useState(0);
  const [orgs, setOrgs] = useState([]);
  const [places, setPlaces] = useState([]);
  const [machines, setMachines] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generic create/edit dialog state
  const [dialog, setDialog] = useState({ open: false, mode: 'create', entity: '', data: {} });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [o, p, m, mt] = await Promise.all([
        orgApi.getAll(), placeApi.getAll(), machineApi.getAll(), metricApi.getAll()
      ]);
      setOrgs(o.data); setPlaces(p.data);
      setMachines(m.data); setMetrics(mt.data);
    } catch { setError('Failed to load data.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openCreate = (entity) => setDialog({ open: true, mode: 'create', entity, data: {} });
  const openEdit = (entity, data) => setDialog({ open: true, mode: 'edit', entity, data });
  const closeDialog = () => setDialog({ ...dialog, open: false });

  const handleSave = async () => {
    const { entity, mode, data } = dialog;
    setError('');
    try {
      if (entity === 'org') {
        mode === 'create' ? await orgApi.create(data) : await orgApi.update(data.id, data);
      } else if (entity === 'place') {
        mode === 'create' ? await placeApi.create(data) : await placeApi.update(data.id, data);
      } else if (entity === 'machine') {
        mode === 'create' ? await machineApi.create(data) : await machineApi.update(data.id, data);
      } else if (entity === 'metric') {
        mode === 'create' ? await metricApi.create(data) : await metricApi.update(data.id, data);
      }
      setSuccess(`${entity} ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      closeDialog();
      loadAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed.');
    }
  };

  const handleDelete = async (entity, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (entity === 'org') await orgApi.delete(id);
      else if (entity === 'place') await placeApi.delete(id);
      else if (entity === 'machine') await machineApi.delete(id);
      else if (entity === 'metric') await metricApi.delete(id);
      setSuccess('Deleted successfully.');
      loadAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed.');
    }
  };

  const updateField = (key, value) =>
    setDialog(d => ({ ...d, data: { ...d.data, [key]: value } }));

  const EntityTable = ({ rows, columns, entity }) => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map(c => <TableCell key={c.key}>{c.label}</TableCell>)}
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                No {entity}s found. Create one above.
              </TableCell>
            </TableRow>
          ) : rows.map(row => (
            <TableRow key={row.id} hover>
              {columns.map(c => (
                <TableCell key={c.key}>
                  {c.render ? c.render(row[c.key], row) : row[c.key] ?? '—'}
                </TableCell>
              ))}
              <TableCell align="center">
                <Tooltip title="Edit">
                  <IconButton size="small" color="primary" onClick={() => openEdit(entity, row)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => handleDelete(entity, row.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const tabConfig = [
    { label: 'Organizations', icon: <Business />, entity: 'org', rows: orgs, columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'placeCount', label: 'Places', render: v => <Chip label={v} size="small" sx={{ bgcolor: 'rgba(0,200,83,0.1)', color: 'primary.main' }} /> },
    ]},
    { label: 'Places', icon: <LocationOn />, entity: 'place', rows: places, columns: [
      { key: 'name', label: 'Name' },
      { key: 'location', label: 'Location' },
      { key: 'organizationName', label: 'Organization' },
      { key: 'machineCount', label: 'Machines', render: v => <Chip label={v} size="small" sx={{ bgcolor: 'rgba(0,200,83,0.1)', color: 'primary.main' }} /> },
    ]},
    { label: 'Machines', icon: <Memory />, entity: 'machine', rows: machines, columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'placeName', label: 'Place' },
    ]},
    { label: 'Metrics', icon: <BarChart />, entity: 'metric', rows: metrics, columns: [
      { key: 'name', label: 'Name' },
      { key: 'unit', label: 'Unit' },
      { key: 'threshold', label: 'Threshold', render: v => v ? Number(v).toLocaleString() : 'Dynamic (2× avg)' },
    ]},
  ];

  const currentTab = tabConfig[tab];

  return (
    <Box className="animate-fade-in">
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Organization Setup</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage the hierarchical structure: Organizations → Places → Machines → Metrics.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}
              TabIndicatorProps={{ style: { background: '#00C853' } }}>
              {tabConfig.map((t, i) => (
                <Tab key={i} label={t.label} icon={t.icon} iconPosition="start"
                  sx={{ minHeight: 48, '&.Mui-selected': { color: 'primary.main' } }} />
              ))}
            </Tabs>
            <Button id={`add-${currentTab?.entity}-btn`} variant="contained" startIcon={<Add />}
              onClick={() => openCreate(currentTab?.entity)}>
              Add {currentTab?.label?.slice(0, -1)}
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress color="primary" /></Box>
          ) : tabConfig.map((t, i) => (
            <TabPanel key={i} value={tab} index={i}>
              <EntityTable rows={t.rows} columns={t.columns} entity={t.entity} />
            </TabPanel>
          ))}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialog.mode === 'create' ? 'Create' : 'Edit'} {dialog.entity?.charAt(0).toUpperCase() + dialog.entity?.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Organization fields */}
            {dialog.entity === 'org' && <>
              <TextField id="d-org-name" fullWidth label="Name *" value={dialog.data.name || ''}
                onChange={e => updateField('name', e.target.value)} />
              <TextField id="d-org-desc" fullWidth label="Description" multiline rows={2}
                value={dialog.data.description || ''} onChange={e => updateField('description', e.target.value)} />
            </>}

            {/* Place fields */}
            {dialog.entity === 'place' && <>
              <TextField id="d-place-name" fullWidth label="Name *" value={dialog.data.name || ''}
                onChange={e => updateField('name', e.target.value)} />
              <TextField id="d-place-loc" fullWidth label="Location" value={dialog.data.location || ''}
                onChange={e => updateField('location', e.target.value)} />
              <TextField id="d-place-org" select fullWidth label="Organization *"
                value={dialog.data.organizationId || ''}
                onChange={e => updateField('organizationId', e.target.value)}>
                {orgs.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
              </TextField>
            </>}

            {/* Machine fields */}
            {dialog.entity === 'machine' && <>
              <TextField id="d-machine-name" fullWidth label="Name *" value={dialog.data.name || ''}
                onChange={e => updateField('name', e.target.value)} />
              <TextField id="d-machine-desc" fullWidth label="Description" value={dialog.data.description || ''}
                onChange={e => updateField('description', e.target.value)} />
              <TextField id="d-machine-place" select fullWidth label="Place *"
                value={dialog.data.placeId || ''}
                onChange={e => updateField('placeId', e.target.value)}>
                {places.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </TextField>
            </>}

            {/* Metric fields */}
            {dialog.entity === 'metric' && <>
              <TextField id="d-metric-name" fullWidth label="Name *" value={dialog.data.name || ''}
                onChange={e => updateField('name', e.target.value)} />
              <TextField id="d-metric-unit" fullWidth label="Unit *" placeholder="e.g. kWh, kgCO2, m3"
                value={dialog.data.unit || ''} onChange={e => updateField('unit', e.target.value)} />
              <TextField id="d-metric-desc" fullWidth label="Description" value={dialog.data.description || ''}
                onChange={e => updateField('description', e.target.value)} />
              <TextField id="d-metric-threshold" fullWidth label="Anomaly Threshold (leave blank for 2× avg rule)"
                type="number" inputProps={{ step: 'any', min: 0 }}
                value={dialog.data.threshold || ''}
                onChange={e => updateField('threshold', e.target.value)} />
            </>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button id="d-save-btn" variant="contained" onClick={handleSave}>
            {dialog.mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
