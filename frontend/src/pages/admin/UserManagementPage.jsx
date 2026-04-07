import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton,
  Tooltip, Alert, CircularProgress, Chip, Avatar
} from '@mui/material';
import { PersonAdd, Edit, Block, CheckCircle } from '@mui/icons-material';
import { userApi, orgApi, authApi } from '../../api';

const ROLE_COLORS = {
  ADMIN: 'error', MANAGER: 'warning', ANALYST: 'info', EMPLOYEE: 'success'
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create user dialog
  const [createDialog, setCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE', organizationId: '' });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit dialog
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({ name: '', role: '', organizationId: '', isActive: true });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, oRes] = await Promise.all([userApi.getAll(), orgApi.getAll()]);
      setUsers(uRes.data);
      setOrgs(oRes.data);
    } catch { setError('Failed to load users.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    setCreateLoading(true);
    setError('');
    try {
      await authApi.register({
        ...createForm,
        organizationId: createForm.organizationId || null,
      });
      setSuccess('User created successfully!');
      setCreateDialog(false);
      setCreateForm({ name: '', email: '', password: '', role: 'EMPLOYEE', organizationId: '' });
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create user.');
    } finally { setCreateLoading(false); }
  };

  const openEdit = (user) => {
    setEditDialog({ open: true, user });
    setEditForm({ name: user.name, role: user.role, organizationId: user.organizationId || '', isActive: user.isActive });
  };

  const handleEdit = async () => {
    try {
      await userApi.update(editDialog.user.id, {
        name: editForm.name,
        role: editForm.role,
        organizationId: editForm.organizationId || null,
        isActive: editForm.isActive,
      });
      setSuccess('User updated.');
      setEditDialog({ open: false, user: null });
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed.');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await userApi.update(user.id, { isActive: !user.isActive });
      load();
    } catch { setError('Failed to update user status.'); }
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>User Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage system users and their roles.</Typography>
        </Box>
        <Button id="create-user-btn" variant="contained" startIcon={<PersonAdd />}
          onClick={() => setCreateDialog(true)}>
          New User
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress color="primary" /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id} hover sx={{ opacity: u.isActive ? 1 : 0.5 }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: '0.75rem', fontWeight: 700 }}>
                            {initials(u.name)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{u.email}</TableCell>
                      <TableCell>
                        <Chip label={u.role} color={ROLE_COLORS[u.role] || 'default'} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{u.organizationName || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.isActive ? 'Active' : 'Inactive'}
                          color={u.isActive ? 'success' : 'default'}
                          size="small" variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Edit">
                            <IconButton id={`edit-user-${u.id}`} size="small" color="primary" onClick={() => openEdit(u)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={u.isActive ? 'Deactivate' : 'Activate'}>
                            <IconButton id={`toggle-user-${u.id}`} size="small"
                              color={u.isActive ? 'default' : 'success'}
                              onClick={() => handleToggleActive(u)}>
                              {u.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField id="cu-name" fullWidth label="Full Name *" value={createForm.name}
              onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
            <TextField id="cu-email" fullWidth label="Email *" type="email" value={createForm.email}
              onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
            <TextField id="cu-password" fullWidth label="Password *" type="password" value={createForm.password}
              onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
            <TextField id="cu-role" select fullWidth label="Role *" value={createForm.role}
              onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
              {['ADMIN', 'MANAGER', 'ANALYST', 'EMPLOYEE'].map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
            <TextField id="cu-org" select fullWidth label="Organization" value={createForm.organizationId}
              onChange={e => setCreateForm(f => ({ ...f, organizationId: e.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {orgs.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button id="cu-submit-btn" variant="contained" onClick={handleCreate} disabled={createLoading}
            startIcon={createLoading && <CircularProgress size={16} sx={{ color: '#fff' }} />}>
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User — {editDialog.user?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField id="eu-name" fullWidth label="Full Name" value={editForm.name}
              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            <TextField id="eu-role" select fullWidth label="Role" value={editForm.role}
              onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
              {['ADMIN', 'MANAGER', 'ANALYST', 'EMPLOYEE'].map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
            <TextField id="eu-org" select fullWidth label="Organization" value={editForm.organizationId}
              onChange={e => setEditForm(f => ({ ...f, organizationId: e.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {orgs.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>Cancel</Button>
          <Button id="eu-save-btn" variant="contained" onClick={handleEdit}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
