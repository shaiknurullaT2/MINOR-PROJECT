import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  // Base URL is relative, assuming proxy is set in vite.config.js or same domain
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401s and force logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error represents an expired or invalid token
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem('token');
      
      // We don't have access to useNavigate here easily,
      // so we use window.location to force a redirect to login.
      // This is a robust fallback for global interceptors.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
