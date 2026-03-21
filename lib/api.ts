import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('rms_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
};

// Customer API
export const customerApi = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getById: (id: string | number) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string | number, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string | number) => api.delete(`/customers/${id}`),
  getHistory: (id: string | number) => api.get(`/customers/${id}/bookings`),
};

// Inventory API
export const inventoryApi = {
  getAll: (params?: any) => api.get('/inventory', { params }),
  getById: (id: string | number) => api.get(`/inventory/${id}`),
  getByBarcode: (barcode: string) => api.get(`/inventory/barcode/${barcode}`),
  create: (data: any) => api.post('/inventory', data),
  update: (id: string | number, data: any) => api.put(`/inventory/${id}`, data),
  delete: (id: string | number) => api.delete(`/inventory/${id}`),
};

// Category API
export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// Booking API
export const bookingApi = {
  getAll: (params?: any) => api.get('/bookings', { params }),
  getById: (id: string | number) => api.get(`/bookings/${id}`),
  create: (data: any) => api.post('/bookings', data),
  cancel: (id: string | number) => api.post(`/bookings/${id}/cancel`),
  recordPayment: (id: string | number, data: any) => api.post(`/bookings/${id}/payments`, data),
};

// Delivery API
export const deliveryApi = {
  getAll: (params?: any) => api.get('/deliveries', { params }),
  getById: (id: string | number) => api.get(`/deliveries/${id}`),
  prepare: (id: string | number) => api.post(`/deliveries/${id}/prepare`),
  deliver: (id: string | number) => api.post(`/deliveries/${id}/deliver`),
};

// Return API
export const returnApi = {
  getAll: (params?: any) => api.get('/returns', { params }),
  getById: (id: string | number) => api.get(`/returns/${id}`),
  process: (data: any) => api.post('/returns', data),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
