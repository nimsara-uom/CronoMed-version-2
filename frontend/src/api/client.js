import axios from 'axios';

// SECURITY NOTE: The JWT is stored in localStorage for simplicity.
// localStorage is readable by any JS on the page, making it vulnerable to XSS-based
// token theft. A production deployment should move to an httpOnly cookie issued by
// the backend, which is inaccessible to JavaScript entirely.

const api = axios.create({
  // #3 — API base URL is now externalized via VITE_API_BASE_URL in .env
  // Override it per environment without touching source code.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});


// Adding the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Error checking
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error?.config?.url || '';

    // handling 401
    if (error?.response?.status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('doctorId');
      window.location.href = '/';
    }

    // redirect to home page
    return Promise.reject(error);
  }
);

export default api;
