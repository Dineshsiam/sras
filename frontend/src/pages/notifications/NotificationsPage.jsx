import { useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, List, ListItem, ListItemText,
  ListItemIcon, IconButton, Button, Tooltip, Chip, Divider,
  CircularProgress, Alert
} from '@mui/material';
import {
  CheckCircle, Circle, DoneAll, NotificationsNone,
  CheckCircleOutline, Error, Info, Warning
} from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationContext';

const TYPE_CONFIG = {
  DATA_APPROVED:     { icon: <CheckCircleOutline />, color: 'success.main' },
  DATA_REJECTED:     { icon: <Error />,              color: 'error.main' },
  DATA_SUBMITTED:    { icon: <Info />,               color: 'info.main' },
  ANOMALY_DETECTED:  { icon: <Warning />,            color: 'warning.main' },
  TASK_ASSIGNED:     { icon: <CheckCircle />,        color: 'primary.main' },
  SYSTEM:            { icon: <NotificationsNone />,  color: 'text.secondary' },
};

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markRead, markAllRead, unreadCount } = useNotifications();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            Notifications
            {unreadCount > 0 && (
              <Chip label={unreadCount} color="error" size="small" sx={{ fontWeight: 700 }} />
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your in-app alerts and system messages.
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button id="mark-all-read-btn" variant="outlined" startIcon={<DoneAll />}
            onClick={markAllRead} size="small">
            Mark all as read
          </Button>
        )}
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <NotificationsNone sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">You're all caught up! No notifications.</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((n, i) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.SYSTEM;
                return (
                  <Box key={n.id}>
                    {i > 0 && <Divider sx={{ borderColor: 'divider' }} />}
                    <ListItem
                      id={`notification-${n.id}`}
                      alignItems="flex-start"
                      sx={{
                        px: 3, py: 2,
                        bgcolor: n.isRead ? 'transparent' : 'rgba(0,200,83,0.04)',
                        cursor: n.isRead ? 'default' : 'pointer',
                        '&:hover': { bgcolor: 'rgba(0,200,83,0.06)' },
                        transition: 'background-color 0.15s',
                      }}
                      onClick={() => !n.isRead && markRead(n.id)}
                      secondaryAction={
                        !n.isRead && (
                          <Tooltip title="Mark as read">
                            <IconButton
                              id={`mark-read-${n.id}`}
                              edge="end" size="small"
                              onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                              sx={{ color: 'primary.main' }}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )
                      }
                    >
                      <ListItemIcon sx={{ mt: 0.5, minWidth: 36, color: config.color }}>
                        {config.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography
                              variant="body2"
                              fontWeight={n.isRead ? 400 : 700}
                              sx={{ color: n.isRead ? 'text.secondary' : 'text.primary' }}
                            >
                              {n.message}
                            </Typography>
                            {!n.isRead && (
                              <Circle sx={{ fontSize: 8, color: 'primary.main' }} />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={n.type?.replace(/_/g, ' ')}
                              size="small"
                              sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.05)' }}
                            />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {new Date(n.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Box>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
