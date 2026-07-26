import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    return Promise.reject(error);
  }
);

export default api;
