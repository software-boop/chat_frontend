import axios from 'axios';
import API_URL from './config';

const api = axios.create({
  baseURL: API_URL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (username, password) =>
  api.post('/auth/register', { username, password });

export const login = (username, password) =>
  api.post('/auth/login', { username, password });

// Messages
export const getMessages = (page = 1, limit = 100) =>
  api.get(`/messages?page=${page}&limit=${limit}`);

export const sendMessage = (text, image) =>
  api.post('/messages', { text, image });

export const reactToMessage = (messageId, emoji) =>
  api.post(`/messages/${messageId}/react`, { emoji });

export const markSeen = () =>
  api.put('/messages/seen');

// Upload
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default api;
