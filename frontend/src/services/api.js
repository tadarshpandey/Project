import axios from 'axios';

// Resolve base URL from Vite environment or default to local Django development port
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Interceptor for response handling and clean error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected network error occurred.';
    if (error.response) {
      // Server returned error status code
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response.data === 'object') {
          const messages = [];
          for (const [key, value] of Object.entries(error.response.data)) {
            const valStr = Array.isArray(value) ? value.join(' ') : value;
            messages.push(`${key}: ${valStr}`);
          }
          errorMessage = messages.join('\n') || 'Server validation error';
        }
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check if the Django backend is running at ' + API_BASE_URL;
    }
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
