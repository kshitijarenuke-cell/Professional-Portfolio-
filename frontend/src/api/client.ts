import axios from 'axios';

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return '/api';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token from localStorage for reliable cross-origin authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('portfolio_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to resolve backend-served assets (like /uploads/...) to full backend URLs in production
export const resolveBackendAssetUrl = (url?: string): string => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const cleanBase = envUrl.replace(/\/+$/, '').replace(/\/api$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${cleanBase}${cleanPath}`;
  }
  return url;
};

// Helper for file uploads
export const uploadFile = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await api.post<{ success: boolean; url: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.success ? res.data.url : null;
  } catch (err) {
    console.error('[Upload API Error]', err);
    return null;
  }
};
