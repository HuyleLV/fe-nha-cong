import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth interceptor if needed
const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const financeService = {
    getCashFlow: async (startDate: string, endDate: string, buildingId?: number) => {
        const response = await api.get('/finance/cash-flow', {
            params: { startDate, endDate, buildingId }
        });
        return response.data;
    },

    getProfitLoss: async (year: number, period?: string) => {
        const response = await api.get('/finance/profit-loss', {
            params: { year, period }
        });
        return response.data;
    },

    getDebts: async (page = 1, limit = 20) => {
        const response = await api.get('/finance/debts', {
            params: { page, limit }
        });
        return response.data;
    },

    getBrokerage: async (page = 1, limit = 20) => {
        const response = await api.get('/finance/brokerage', {
            params: { page, limit }
        });
        return response.data;
    },

    getAssets: async () => {
        const response = await api.get('/finance/assets');
        return response.data;
    }
};

export default financeService;
