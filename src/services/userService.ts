import axiosClient from "@/utils/axiosClient";

export interface UserProfile {
    id: number;
    email: string;
    name: string;
    phone: string;
    avatarUrl?: string;
    // Add other fields as needed
}

export const userService = {
    getProfile: async () => {
        // Changed from /users/profile to /auth/me as /users/profile does not exist
        return axiosClient.get('/auth/me') as Promise<UserProfile>;
    },

    updateProfile: async (data: Partial<UserProfile>) => {
        // Assuming update profile still goes to a user endpoint, but currently no self-update in UsersController?
        // UsersController only has admin methods provided.
        // AuthController has completeProfile.
        // Let's keep it as is or fallback to specific update route if exists.
        // Checking UsersController again, it only has admin/users. 
        // We might need to implement a self-update endpoint in backend. 
        // For now, I will point to /auth/complete-profile if it matches or keep as /users/profile and note logic gap if backend doesn't support it.
        // Actually, let's leave updateProfile pointing to /users/profile BUT warn user or I should check if I should implement it. 
        // The user complained about 404 on GET.
        // Let's fix GET first.
        return axiosClient.patch('/users/profile', data) as Promise<UserProfile>;
    },

    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }) as Promise<any>;
    },

    // Admin User Management
    listAdminUsers: async (params?: any) => {
        return axiosClient.get('/admin/users', { params }) as Promise<any>;
    },
    getAdminUser: async (id: number) => {
        return axiosClient.get(`/admin/users/${id}`) as Promise<any>;
    },
    createAdminUser: async (data: any) => {
        return axiosClient.post('/admin/users', data) as Promise<any>;
    },
    updateAdminUser: async (id: number, data: any) => {
        return axiosClient.patch(`/admin/users/${id}`, data) as Promise<any>;
    },
    deleteAdminUser: async (id: number) => {
        return axiosClient.delete(`/admin/users/${id}`) as Promise<any>;
    },

    // Auth & Verification
    postRequestEmailVerification: async () => {
        return axiosClient.post('/auth/request-email-verification') as Promise<any>;
    },
    postVerifyEmail: async (data: { email: string; code: string }) => {
        return axiosClient.post('/auth/verify-email', data) as Promise<any>;
    },
    postStartRegisterPhone: async (data: { phone: string }) => {
        return axiosClient.post('/auth/request-phone-verification', data) as Promise<any>;
    },
    postVerifyPhone: async (data: { phone: string; code: string }) => {
        return axiosClient.post('/auth/verify-phone', data) as Promise<any>;
    },
    postChangePassword: async (data: any) => {
        // Auth controller has change-password
        return axiosClient.post('/auth/change-password', data) as Promise<any>;
    },
    postLoginAdmin: async (data: { identifier: string; password_hash: string }) => {
        return axiosClient.post('/auth/login-admin', data) as Promise<any>;
    },
    postResetPassword: async (data: { token: string; newPassword: string; confirmNewPassword: string }) => {
        return axiosClient.post('/auth/reset-password', data) as Promise<any>;
    },

    // Missing methods implementation matching backend AuthController
    postLoginUser: async (data: { identifier: string; password_hash: string }) => {
        return axiosClient.post('/auth/login', data) as Promise<any>;
    },
    postRegisterUser: async (data: any) => {
        return axiosClient.post('/auth/register', data) as Promise<any>;
    },
    postForgotPassword: async (data: { email: string }) => {
        return axiosClient.post('/auth/forgot-password', data) as Promise<any>;
    },
    postLoginGoogleCode: async (data: { code: string; redirectUri: string }) => {
        return axiosClient.post('/auth/login-google-code', data) as Promise<any>;
    }
};

export default userService;
