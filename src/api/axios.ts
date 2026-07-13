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

export { API_URL as API_BASE_URL }
export default api;