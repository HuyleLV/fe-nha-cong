import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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

export interface HostSettings {
    profile: {
        displayName?: string;
        phone?: string;
        email?: string;
        address?: string;
        bio?: string;
    };
    notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
        bookingAlerts: boolean;
        paymentAlerts: boolean;
        contractAlerts: boolean;
        taskAlerts: boolean;
    };
    payment: {
        bankName?: string;
        accountNumber?: string;
        accountHolder?: string;
        bankBranch?: string;
    };
    storage: {
        preferredType?: 'local' | 's3' | 'spaces';
        customCdnUrl?: string;
    };
    preferences: {
        language?: string;
        timezone?: string;
        dateFormat?: string;
        currency?: string;
    };
}

export const hostSettingsService = {
    getSettings: async () => {
        const response = await api.get('/host/settings');
        return response.data;
    },

    updateSettings: async (settings: Partial<HostSettings>) => {
        const response = await api.patch('/host/settings', settings);
        return response.data;
    },

    resetSettings: async () => {
        const response = await api.delete('/host/settings');
        return response.data;
    }
};

export default hostSettingsService;
