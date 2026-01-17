import axiosClient from '@/utils/axiosClient';

export interface UserProfile {
    id: number;
    email: string;
    name: string;
    phone: string;
    avatarUrl?: string | null;
    // other fields as used by FE
}

export const userService = {
    // Public / auth endpoints
    postLoginUser: async (body: Record<string, any>) => {
        return axiosClient.post('/api/auth/login', body);
    },

    postLoginAdmin: async (body: Record<string, any>) => {
        return axiosClient.post('/api/auth/login-admin', body);
    },

    postLoginGoogleCode: async (body: Record<string, any>) => {
        return axiosClient.post('/api/auth/login-google-code', body);
    },

    postRegisterUser: async (body: Record<string, any>) => {
        return axiosClient.post('/api/auth/register', body);
    },

    postForgotPassword: async (body: { email: string }) => {
        return axiosClient.post('/api/auth/forgot-password', body);
    },

    postResetPassword: async (body: { token: string; newPassword: string; confirmNewPassword: string }) => {
        return axiosClient.post('/api/auth/reset-password', body);
    },

    postStartRegisterPhone: async (body: { phone: string }) => {
        return axiosClient.post('/api/auth/start-register-phone', body);
    },

    postVerifyPhone: async (body: { phone: string; code: string }) => {
        return axiosClient.post('/api/auth/verify-phone', body);
    },

    postVerifyEmail: async (body: { email: string; code: string }) => {
        return axiosClient.post('/api/auth/verify-email', body);
    },

    postRequestEmailVerification: async () => {
        // requires auth
        return axiosClient.post('/api/auth/request-email-verification');
    },

    postCompleteProfile: async (body: Record<string, any>) => {
        return axiosClient.post('/api/auth/complete-profile', body);
    },

    postChangePassword: async (body: Record<string, any>) => {
        return axiosClient.post('/api/auth/change-password', body);
    },

    // User resource
    getMe: async () => {
        return axiosClient.get('/api/auth/me');
    },

    getAdminUser: async (id: number | string) => {
        return axiosClient.get(`/api/admin/users/${encodeURIComponent(String(id))}`);
    },

    updateProfile: async (body: Record<string, any>) => {
        return axiosClient.patch('/api/users/profile', body);
    },

    uploadAvatar: async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return axiosClient.post('/api/users/avatar', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default userService;
