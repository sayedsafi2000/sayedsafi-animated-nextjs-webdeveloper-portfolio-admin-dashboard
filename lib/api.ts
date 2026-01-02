import axios from 'axios';

// API URL configuration
// Priority: Environment variable > Local development fallback
// Local development: Use env var if set, otherwise fallback to localhost:5000
// Production: Environment variable is required
const getAPIURL = () => {
  // First, check if environment variable is set (works everywhere)
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Check if env var exists and is not empty
  if (envApiUrl && envApiUrl.trim() !== '') {
    return envApiUrl.trim();
  }
  
  // If no env var, check if we're in local development
  const isNodeDevelopment = process.env.NODE_ENV === 'development';
  const isClientLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  // In local development without env var, use localhost backend
  if (isNodeDevelopment || isClientLocalhost) {
    return 'http://localhost:5000/api';
  }
  
  // In production without env var, this is an error
  return ''; // Return empty string to make errors obvious
};

const API_URL = getAPIURL();

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Blog API
export const blogAPI = {
  getAll: async (params?: { published?: boolean; category?: string; limit?: number; page?: number }) => {
    const response = await api.get('/blog', { params });
    return response.data;
  },
  getBySlug: async (slug: string) => {
    const response = await api.get(`/blog/${slug}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/blog', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/blog/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/blog/${id}`);
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (params?: { featured?: boolean; isCustomCode?: boolean; category?: string; limit?: number; page?: number }) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/projects', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

// Services API
export const servicesAPI = {
  getAll: async (params?: { active?: boolean; limit?: number; page?: number }) => {
    const response = await api.get('/services', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/services', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },
  deleteImage: async (publicId: string) => {
    const response = await api.delete(`/upload/${publicId}`);
    return response.data;
  },
};

export default api;

