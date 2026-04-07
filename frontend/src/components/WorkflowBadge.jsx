import { Chip } from '@mui/material';

const STATUS_CONFIG = {
  PENDING:  { label: 'Pending',  color: 'warning' },
  APPROVED: { label: 'Approved', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'error'   },
};

export default function WorkflowBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'default' };
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{ fontWeight: 700, borderRadius: '6px' }}
    />
  );
}
