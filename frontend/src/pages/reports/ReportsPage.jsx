import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, MenuItem,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Chip, IconButton, Tooltip, Divider
} from '@mui/material';
import { Download, Assessment, PictureAsPdf, TableView } from '@mui/icons-material';
import { reportApi } from '../../api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ type: 'OVERALL', format: 'PDF', entityId: '' });

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportApi.getAll({ page: 0, size: 20 });
      setReports(res.data.content || []);
    } catch { setError('Failed to load reports.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      await reportApi.generate({
        type: form.type,
        format: form.format,
        entityId: form.entityId ? Number(form.entityId) : null,
      });
      setSuccess('Report generated successfully!');
      loadReports();
    } catch (e) {
      setError(e.response?.data?.message || 'Report generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    try {
      const res = await reportApi.download(report.id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch { setError('Download failed.'); }
  };

  return (
    <Box className="animate-fade-in">
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Reports</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Generate and download sustainability reports in PDF or Excel.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Generate Form */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment sx={{ color: 'primary.main' }} /> Generate Report
              </Typography>
              <TextField id="r-type" select fullWidth label="Report Type" value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))} sx={{ mb: 2 }}>
                <MenuItem value="OVERALL">Overall (Organization)</MenuItem>
                <MenuItem value="PLACE">Place-Specific</MenuItem>
                <MenuItem value="MACHINE">Machine-Specific</MenuItem>
              </TextField>
              <TextField id="r-format" select fullWidth label="Format" value={form.format}
                onChange={e => setForm(f => ({ ...f, format: e.target.value }))} sx={{ mb: 2 }}>
                <MenuItem value="PDF">📄 PDF</MenuItem>
                <MenuItem value="EXCEL">📊 Excel</MenuItem>
              </TextField>
              {(form.type === 'PLACE' || form.type === 'MACHINE') && (
                <TextField id="r-entity" fullWidth label={`${form.type === 'PLACE' ? 'Place' : 'Machine'} ID`}
                  type="number" value={form.entityId}
                  onChange={e => setForm(f => ({ ...f, entityId: e.target.value }))} sx={{ mb: 2 }} />
              )}
              <Button id="r-generate-btn" variant="contained" fullWidth size="large"
                onClick={handleGenerate} disabled={generating}
                startIcon={generating ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Assessment />}>
                {generating ? 'Generating...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Report History */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Report History</Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress color="primary" />
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Format</TableCell>
                        <TableCell>Generated By</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="center">Download</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            No reports generated yet.
                          </TableCell>
                        </TableRow>
                      ) : reports.map(r => (
                        <TableRow key={r.id} hover>
                          <TableCell>
                            <Chip label={r.type} size="small"
                              sx={{ bgcolor: 'rgba(0,200,83,0.1)', color: 'primary.light', fontWeight: 600 }} />
                          </TableCell>
                          <TableCell>
                            {r.format === 'PDF'
                              ? <Chip icon={<PictureAsPdf fontSize="small" />} label="PDF" size="small" color="error" variant="outlined" />
                              : <Chip icon={<TableView fontSize="small" />} label="Excel" size="small" color="success" variant="outlined" />}
                          </TableCell>
                          <TableCell>{r.generatedByName}</TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                            {new Date(r.generatedAt).toLocaleString()}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Download">
                              <IconButton id={`download-${r.id}`} size="small" color="primary" onClick={() => handleDownload(r)}>
                                <Download fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
