import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import theme from './theme/theme';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DataEntryPage from './pages/dataentry/DataEntryPage';
import MySubmissionsPage from './pages/dataentry/MySubmissionsPage';
import ValidationQueuePage from './pages/workflow/ValidationQueuePage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import ReportsPage from './pages/reports/ReportsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import OrgSetupPage from './pages/admin/OrgSetupPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProfilePage from './pages/auth/ProfilePage';
import Layout from './components/layout/Layout';

// ─── Protected Route ─────────────────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={
        <ProtectedRoute><Layout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="data-entry" element={
          <ProtectedRoute roles={['EMPLOYEE','ANALYST','ADMIN']}>
            <DataEntryPage />
          </ProtectedRoute>
        } />
        <Route path="my-submissions" element={<MySubmissionsPage />} />
        <Route path="validation-queue" element={
          <ProtectedRoute roles={['ANALYST','ADMIN']}>
            <ValidationQueuePage />
          </ProtectedRoute>
        } />
        <Route path="analytics" element={
          <ProtectedRoute roles={['ADMIN','MANAGER','ANALYST']}>
            <AnalyticsPage />
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute roles={['ADMIN','MANAGER']}>
            <ReportsPage />
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute roles={['ADMIN']}>
            <UserManagementPage />
          </ProtectedRoute>
        } />
        <Route path="org-setup" element={
          <ProtectedRoute roles={['ADMIN']}>
            <OrgSetupPage />
          </ProtectedRoute>
        } />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
