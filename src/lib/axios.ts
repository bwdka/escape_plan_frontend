import axios from 'axios';

const api = axios.create({
  // baseURL: 'https://api.escapeplan.com/api/v1',
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    // In a real app, you might get this from cookies or localStorage via a helper
    // For server-side, you'd use cookies().get('token')
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      if (typeof window !== 'undefined') {
        // window.location.href = '/login'; // Optional: Force redirect
      }
    }
    return Promise.reject(error);
  }
);

export default api;
