import axios from 'axios';

const normalizeApiUrl = (url: string) => {
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const rawUrl = import.meta.env.VITE_API_BASE_URL;
const API_URL = (rawUrl && rawUrl.trim() !== '')
  ? normalizeApiUrl(rawUrl.trim())
  : "https://itaccess-backend-production-5145.up.railway.app";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RejectCustom = (reason: Error) => void;
let pending401Reject: RejectCustom | null = null;

api.interceptors.response.use(
  (response) => {
    const contentType = response.headers['content-type'];
    if (contentType && String(contentType).includes('text/html')) {
      return Promise.reject(new Error("L'API a renvoyé du HTML. Vérifiez VITE_API_BASE_URL dans votre .env"));
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      if (pending401Reject) {
        return;
      }
      try {
        localStorage.removeItem('token');
        if (pending401Reject) {
          (pending401Reject as RejectCustom)(new Error('Session expirée, veuillez vous reconnecter.'));
        }
      } catch {
        // ignore
      } finally {
        pending401Reject = null;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('session-expired'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;