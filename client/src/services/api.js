import axios from 'axios';

// Connect directly to backend API (or fallback to /api)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if we are not already on the login page
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 1. Check Payload Keys: Ensure payload explicitly sends { phoneNumber }
export const authApi = {
  login: (phoneNumber) => {
    const rawVal =
      typeof phoneNumber === 'object' && phoneNumber !== null
        ? phoneNumber.phoneNumber || phoneNumber.phone
        : phoneNumber;
    return API.post('/auth/login', { phoneNumber: String(rawVal).trim() });
  },
  getMe: () => API.get('/auth/me'),
};

// Project Services
export const projectApi = {
  getAll: () => API.get('/projects'),
  getById: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
};

// Worker Services
export const workerApi = {
  getAll: (params) => API.get('/workers', { params }),
  getById: (id) => API.get(`/workers/${id}`),
  create: (data) => API.post('/workers', data),
  update: (id, data) => API.put(`/workers/${id}`, data),
  delete: (id) => API.delete(`/workers/${id}`),
};

// Attendance Services
export const attendanceApi = {
  getByDate: (params) => API.get('/attendance', { params }),
  mark: (data) => API.post('/attendance', data),
  bulkMark: (data) => API.post('/attendance/bulk', data),
  getWorkerHistory: (workerId) => API.get(`/attendance/worker/${workerId}`),
  getTrends: (days = 7) => API.get(`/attendance/trends?days=${days}`),
};

// Advance Services
export const advanceApi = {
  getAll: (params) => API.get('/advances', { params }),
  create: (data) => API.post('/advances', data),
  delete: (id) => API.delete(`/advances/${id}`),
};

// Payroll Services
export const payrollApi = {
  getReport: (params) => API.get('/payroll', { params }),
};

// Payment Services
export const paymentApi = {
  record: (data) => API.post('/payments/record', data),
  confirm: (id) => API.put(`/payments/${id}/confirm`),
  getLedger: (params) => API.get('/payments/ledger', { params }),
};

export default API;
