import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}/token/refresh/`, {
                        refresh: refreshToken,
                    });
                    localStorage.setItem('access_token', response.data.access);
                    error.config.headers.Authorization = `Bearer ${response.data.access}`;
                    return api.request(error.config);
                } catch {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/token/', { username: email, password }),
    register: (email: string, password: string) =>
        api.post('/user/register/', { email, password }),
};

export const categoryAPI = {
    getAll: () => api.get('/categories/'),
    create: (name: string, category_type: string) =>
        api.post('/categories/', { name, category_type }),
    delete: (id: number) => api.delete(`/categories/${id}/`),
};

export const incomeAPI = {
    getAll: (params?: { category?: string; start_date?: string; end_date?: string }) =>
        api.get('/incomes/', { params }),
    create: (data: { amount: number; category?: string; date: string; description: string }) =>
        api.post('/incomes/', data),
    update: (id: number, data: { amount: number; category?: string; date: string; description: string }) =>
        api.put(`/incomes/${id}/`, data),
    delete: (id: number) => api.delete(`/incomes/${id}/`),
};

export const expenseAPI = {
    getAll: (params?: { category?: string; start_date?: string; end_date?: string }) =>
        api.get('/expenses/', { params }),
    create: (data: { amount: number; category?: string; date: string; description: string }) =>
        api.post('/expenses/', data),
    update: (id: number, data: { amount: number; category?: string; date: string; description: string }) =>
        api.put(`/expenses/${id}/`, data),
    delete: (id: number) => api.delete(`/expenses/${id}/`),
};

export const transactionAPI = {
    getAll: (params?: { category?: string; start_date?: string; end_date?: string; type?: string }) =>
        api.get('/transactions/', { params }),
};

export const dashboardAPI = {
    get: (params?: { start_date?: string; end_date?: string }) =>
        api.get('/dashboard/', { params }),
};

export default api;
