import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate or retrieve user ID from localStorage
const getUserId = () => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
};

// Add user ID to request headers
api.interceptors.request.use((config) => {
  const userId = getUserId();
  config.headers['x-user-id'] = userId;
  return config;
});

// Add token to admin requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('adminToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('adminToken');
  }
};

// Load token on app start
const token = localStorage.getItem('adminToken');
if (token) {
  setAuthToken(token);
}

// Student API calls
export const submitComplaint = (department, message) => {
  return api.post('/complaints', { department, message });
};

export const getComplaints = (department, sortBy = 'likes', search = '') => {
  return api.get(`/complaints/${department}`, {
    params: { sortBy, search }
  });
};

export const likeComplaint = (complaintId) => {
  return api.post(`/complaints/${complaintId}/like`);
};

// Admin API calls
export const adminLogin = (email, password) => {
  return api.post('/admin/login', { email, password });
};

export const getAdminComplaints = (sortBy = 'likes', search = '') => {
  return api.get('/admin/complaints', {
    params: { sortBy, search }
  });
};

export const updateComplaintStatus = (complaintId, status) => {
  return api.put(`/admin/complaints/${complaintId}/status`, { status });
};

export const addComplaintReply = (complaintId, reply) => {
  return api.put(`/admin/complaints/${complaintId}/reply`, { reply });
};

export const getAdminStats = () => {
  return api.get('/admin/stats');
};

export default api;

