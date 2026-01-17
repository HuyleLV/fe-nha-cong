import axiosClient from '@/utils/axiosClient';

const API_URL = '/admin/system-settings';

export interface SystemSettings {
    id: number;
    siteTitle: string;
    siteDescription: string | null;
    siteLogo: string | null;
    siteFavicon: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    contactAddress: string | null;
    socialMedia: {
        facebook?: string;
        zalo?: string;
        youtube?: string;
        tiktok?: string;
        instagram?: string;
    } | null;
    storageType: 'local' | 's3' | 'spaces' | 'ftp' | 'cdn';
    storageConfig: any;
    emailConfig: any;
    defaultLanguage: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    metaKeywords: string | null;
    metaDescription: string | null;
    googleAnalyticsId: string | null;
    googleTagManagerId: string | null;
    features: {
        enableRegistration?: boolean;
        enableEmailVerification?: boolean;
        enablePhoneVerification?: boolean;
        enableGoogleLogin?: boolean;
        enableZaloLogin?: boolean;
        enableMaintenanceMode?: boolean;
    } | null;
    maintenanceMode: boolean;
    maintenanceMessage: string | null;
}

export interface UpdateSystemSettingsDto {
    siteTitle?: string;
    siteDescription?: string | null;
    siteLogo?: string | null;
    siteFavicon?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    contactAddress?: string | null;
    socialMedia?: any;
    storageType?: string;
    storageConfig?: any;
    emailConfig?: any;
    defaultLanguage?: string;
    timezone?: string;
    currency?: string;
    dateFormat?: string;
    metaKeywords?: string | null;
    metaDescription?: string | null;
    googleAnalyticsId?: string | null;
    googleTagManagerId?: string | null;
    features?: any;
    maintenanceMode?: boolean;
    maintenanceMessage?: string | null;
}

const getSettings = async (): Promise<SystemSettings> => {
    const response = await axiosClient.get(API_URL);
    return response.data;
};

const getPublicSettings = async (): Promise<Partial<SystemSettings>> => {
    const response = await axiosClient.get(`${API_URL}/public`);
    return response.data;
};

const updateSettings = async (data: UpdateSystemSettingsDto): Promise<SystemSettings> => {
    const response = await axiosClient.patch(API_URL, data);
    return response.data;
};

const getStorageConfig = async (): Promise<any> => {
    const response = await axiosClient.get(`${API_URL}/storage-config`);
    return response.data;
};

const testStorageConnection = async (type: string): Promise<any> => {
    const response = await axiosClient.post(`${API_URL}/test-storage/${type}`);
    return response.data;
};

const systemSettingsService = {
    getSettings,
    getPublicSettings,
    updateSettings,
    getStorageConfig,
    testStorageConnection,
};

export default systemSettingsService;
