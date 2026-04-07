import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Chip, Tooltip, IconButton
} from '@mui/material';
import { CheckCircle, Cancel, Edit } from '@mui/icons-material';
import { dataEntryApi } from '../../api';
import WorkflowBadge from '../../components/WorkflowBadge';

export default function ValidationQueuePage() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Reject dialog
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null, reason: '' });
  // Modify dialog
  const [modifyDialog, setModifyDialog] = useState({ open: false, id: null, value: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dataEntryApi.getAll({ status: 'PENDING', page, size: 15 });
      setEntries(res.data.content || []);
      setTotal(res.data.totalElements || 0);
    } catch { setError('Failed to load queue.'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try { await dataEntryApi.approve(id); load(); }
    catch (e) { setError(e.response?.data?.message || 'Approval failed'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectDialog.reason.trim()) return;
    setActionLoading(true);
    try {
      await dataEntryApi.reject(rejectDialog.id, { reason: rejectDialog.reason });
      setRejectDialog({ open: false, id: null, reason: '' });
      load();
    } catch (e) { setError(e.response?.data?.message || 'Reject failed'); }
    finally { setActionLoading(false); }
  };

  const handleModify = async () => {
    setActionLoading(true);
    try {
      await dataEntryApi.modify(modifyDialog.id, { value: Number(modifyDialog.value), notes: modifyDialog.notes });
      setModifyDialog({ open: false, id: null, value: '', notes: '' });
      load();
    } catch (e) { setError(e.response?.data?.message || 'Modify failed'); }
    finally { setActionLoading(false); }
  };

  return (
    <Box className="animate-fade-in">
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Validation Queue</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review pending data submissions. Approve, reject, or modify values.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Pending Entries
            </Typography>
            <Chip label={total} color="warning" size="small" sx={{ fontWeight: 700 }} />
          </Box>

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
                      <TableCell>Submitted By</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          🎉 No pending entries! All caught up.
                        </TableCell>
                      </TableRow>
                    ) : entries.map(e => (
                      <TableRow key={e.id} hover>
                        <TableCell>{e.placeName}</TableCell>
                        <TableCell>{e.machineName || '—'}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{e.metricName}</Typography>
                          <Typography variant="caption" color="text.secondary">{e.metricUnit}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{Number(e.value).toLocaleString()}</strong>
                        </TableCell>
                        <TableCell>{e.submittedByName}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                          {new Date(e.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Approve">
                              <IconButton
                                id={`approve-${e.id}`}
                                size="small" color="success"
                                onClick={() => handleApprove(e.id)}
                                disabled={actionLoading}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                id={`reject-${e.id}`}
                                size="small" color="error"
                                onClick={() => setRejectDialog({ open: true, id: e.id, reason: '' })}
                                disabled={actionLoading}
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modify & Approve">
                              <IconButton
                                id={`modify-${e.id}`}
                                size="small" color="primary"
                                onClick={() => setModifyDialog({ open: true, id: e.id, value: e.value, notes: '' })}
                                disabled={actionLoading}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div" count={total} page={page} rowsPerPage={15}
                onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[15]}
                sx={{ color: 'text.secondary' }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ ...rejectDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Entry</DialogTitle>
        <DialogContent>
          <TextField
            id="reject-reason"
            autoFocus fullWidth label="Rejection Reason *" multiline rows={3}
            value={rejectDialog.reason}
            onChange={e => setRejectDialog(d => ({ ...d, reason: e.target.value }))}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setRejectDialog({ open: false, id: null, reason: '' })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={!rejectDialog.reason.trim() || actionLoading}>
            {actionLoading ? <CircularProgress size={20} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modify Dialog */}
      <Dialog open={modifyDialog.open} onClose={() => setModifyDialog({ ...modifyDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Modify & Approve</DialogTitle>
        <DialogContent>
          <TextField
            id="modify-value"
            fullWidth label="New Value *" type="number" inputProps={{ step: 'any', min: 0 }}
            value={modifyDialog.value}
            onChange={e => setModifyDialog(d => ({ ...d, value: e.target.value }))}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            id="modify-notes"
            fullWidth label="Notes" multiline rows={2}
            value={modifyDialog.notes}
            onChange={e => setModifyDialog(d => ({ ...d, notes: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setModifyDialog({ open: false, id: null, value: '', notes: '' })}>Cancel</Button>
          <Button variant="contained" onClick={handleModify} disabled={!modifyDialog.value || actionLoading}>
            {actionLoading ? <CircularProgress size={20} /> : 'Modify & Approve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
