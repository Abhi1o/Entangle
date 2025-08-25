import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  paraTwitterLogin: (data) => api.post('/auth/para-twitter', data),
  walletLogin: (data) => api.post('/auth/wallet', data),
  verify: () => api.get('/auth/verify')
};

// Auction API
export const auctionAPI = {
  create: (data) => api.post('/auctions/create', data),
  getActive: () => api.get('/auctions/active'),
  getAuction: (id) => api.get(`/auctions/${id}`),
  getUserAuctions: () => api.get('/auctions/user/created')
};

// Meeting API
export const meetingAPI = {
  access: (token) => api.get(`/meetings/access/${token}`),
  join: (token) => api.get(`/meetings/join/${token}`),
  getNotifications: () => api.get('/meetings/notifications'),
  markNotificationRead: (id) => api.put(`/meetings/notifications/${id}/read`)
};

export default api;
