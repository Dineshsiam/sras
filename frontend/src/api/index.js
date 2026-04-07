import axios from 'axios';

const api = axios.create({
  baseURL: "https://sras.onrender.com" + "/api",
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sars_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sars_token');
      localStorage.removeItem('sars_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/users/me'),
};

// ─── Organizations API ────────────────────────────────────────────────────────
export const orgApi = {
  getAll: () => api.get('/organizations'),
  getById: (id) => api.get(`/organizations/${id}`),
  create: (data) => api.post('/organizations', data),
  update: (id, data) => api.put(`/organizations/${id}`, data),
  delete: (id) => api.delete(`/organizations/${id}`),
};

// ─── Places API ───────────────────────────────────────────────────────────────
export const placeApi = {
  getAll: (organizationId) => api.get('/places', { params: { organizationId } }),
  getById: (id) => api.get(`/places/${id}`),
  create: (data) => api.post('/places', data),
  update: (id, data) => api.put(`/places/${id}`, data),
  delete: (id) => api.delete(`/places/${id}`),
};

// ─── Machines API ─────────────────────────────────────────────────────────────
export const machineApi = {
  getAll: (placeId) => api.get('/machines', { params: { placeId } }),
  getById: (id) => api.get(`/machines/${id}`),
  create: (data) => api.post('/machines', data),
  update: (id, data) => api.put(`/machines/${id}`, data),
  delete: (id) => api.delete(`/machines/${id}`),
};

// ─── Metrics API ──────────────────────────────────────────────────────────────
export const metricApi = {
  getAll: () => api.get('/metrics'),
  getById: (id) => api.get(`/metrics/${id}`),
  create: (data) => api.post('/metrics', data),
  update: (id, data) => api.put(`/metrics/${id}`, data),
  delete: (id) => api.delete(`/metrics/${id}`),
};

// ─── Users API ────────────────────────────────────────────────────────────────
export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ─── Data Entries API ─────────────────────────────────────────────────────────
export const dataEntryApi = {
  submit: (data) => api.post('/data-entries', data),
  getAll: (params) => api.get('/data-entries', { params }),
  getMy: (params) => api.get('/data-entries/my', { params }),
  getById: (id) => api.get(`/data-entries/${id}`),
  approve: (id) => api.put(`/data-entries/${id}/approve`),
  reject: (id, data) => api.put(`/data-entries/${id}/reject`, data),
  modify: (id, data) => api.put(`/data-entries/${id}/modify`, data),
};

// ─── Analytics API ────────────────────────────────────────────────────────────
export const analyticsApi = {
  getOrgOverview: (orgId, params) => api.get(`/analytics/organization/${orgId}`, { params }),
  getPlaceAnalytics: (placeId, params) => api.get(`/analytics/place/${placeId}`, { params }),
  getMachineAnalytics: (machineId, params) => api.get(`/analytics/machine/${machineId}`, { params }),
  getTrends: (params) => api.get('/analytics/trends', { params }),
  getAnomalies: (params) => api.get('/analytics/anomalies', { params }),
};

// ─── Reports API ──────────────────────────────────────────────────────────────
export const reportApi = {
  generate: (data) => api.post('/reports/generate', data),
  getAll: (params) => api.get('/reports', { params }),
  download: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
};

// ─── Notifications API ────────────────────────────────────────────────────────
export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};
