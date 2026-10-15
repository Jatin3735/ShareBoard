const rawApiUrl = import.meta.env.VITE_API_URL;

const fallbackApiUrl = import.meta.env.PROD
  ? 'https://shareboard-backend-qd91.onrender.com/api'
  : 'http://localhost:5000/api';

export const API_URL = (rawApiUrl || fallbackApiUrl).replace(/\/$/, '');
export const BASE_URL = API_URL.replace(/\/api$/, '');