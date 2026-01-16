import axios from '../utils/axios';

const API_URL = '/host/settings';

export interface HostSettings {
    id: number;
    userId: number;
    profile: {
        displayName?: string;
        phone?: string;
        email?: string;
        address?: string;
        bio?: string;
    } | null;
    notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
        bookingAlerts: boolean;
        paymentAlerts: boolean;
        contractAlerts: boolean;
        taskAlerts: boolean;
    } | null;
    payment: {
        bankName?: string;
        accountNumber?: string;
        accountHolder?: string;
        bankBranch?: string;
    } | null;
    storage: {
        preferredType?: 'local' | 's3' | 'spaces';
        customCdnUrl?: string;
    } | null;
    preferences: {
        language?: string;
        timezone?: string;
        dateFormat?: string;
        currency?: string;
    } | null;
}

export interface UpdateHostSettingsDto {
    profile?: any;
    notifications?: any;
    payment?: any;
    storage?: any;
    preferences?: any;
}

const getSettings = async (): Promise<HostSettings> => {
    const response = await axios.get(API_URL);
    return response.data;
};

const updateSettings = async (data: UpdateHostSettingsDto): Promise<HostSettings> => {
    const response = await axios.patch(API_URL, data);
    return response.data;
};

const deleteSettings = async (): Promise<void> => {
    await axios.delete(API_URL);
};

const hostSettingsService = {
    getSettings,
    updateSettings,
    deleteSettings,
};

export default hostSettingsService;
