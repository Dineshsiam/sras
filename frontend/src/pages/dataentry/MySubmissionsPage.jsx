import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, CircularProgress,
  Alert, TextField, MenuItem, Chip
} from '@mui/material';
import { dataEntryApi } from '../../api';
import WorkflowBadge from '../../components/WorkflowBadge';

export default function MySubmissionsPage() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dataEntryApi.getMy({ page, size: rowsPerPage });
      setEntries(res.data.content || []);
      setTotal(res.data.totalElements || 0);
    } catch { setError('Failed to load submissions.'); }
    finally { setLoading(false); }
  }, [page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter ? entries.filter(e => e.status === statusFilter) : entries;

  return (
    <Box className="animate-fade-in">
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>My Submissions</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track all data entries you have submitted.
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Submission History</Typography>
            <TextField
              id="ms-status-filter"
              select size="small" label="Filter by Status" value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </TextField>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Place</TableCell>
                      <TableCell>Machine</TableCell>
                      <TableCell>Metric</TableCell>
                      <TableCell align="right">Value</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No submissions found.
                        </TableCell>
                      </TableRow>
                    ) : filtered.map(e => (
                      <TableRow key={e.id} hover>
                        <TableCell>{e.placeName}</TableCell>
                        <TableCell>{e.machineName || '—'}</TableCell>
                        <TableCell>{e.metricName}</TableCell>
                        <TableCell align="right">
                          <strong>{Number(e.value).toLocaleString()}</strong>
                          <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                            {e.metricUnit}
                          </Typography>
                        </TableCell>
                        <TableCell><WorkflowBadge status={e.status} /></TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {e.notes || '—'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: '0.8rem' }}>
                          {new Date(e.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPageOptions={[15]}
                sx={{ color: 'text.secondary' }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
