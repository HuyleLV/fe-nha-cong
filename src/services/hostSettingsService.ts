import axiosClient from "@/utils/axiosClient";

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
        return axiosClient.get('/host/settings') as Promise<HostSettings>;
    },

    updateSettings: async (settings: Partial<HostSettings>) => {
        return axiosClient.patch('/host/settings', settings) as Promise<HostSettings>;
    },

    resetSettings: async () => {
        return axiosClient.delete('/host/settings') as Promise<any>;
    }
};

export default hostSettingsService;
