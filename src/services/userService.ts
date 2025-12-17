// services/userService.ts
import axiosClient from "@/utils/axiosClient";
import { apiUrl } from "@/utils/apiUrl";
import { Me, User, resLoginUser } from "@/type/user";
import { LoginAdminRequest, LoginUserRequest, RegisterUserRequest, resRegisterUser } from "@/type/user";

export interface TokenAdmin {
    message: string;
    accessToken: string;
    expiresIn: string | number;
    user?: User; // backend now returns the logged-in user object
}

export const userService = {
    async postLoginAdmin(data: LoginAdminRequest): Promise<TokenAdmin> {
        // axiosClient returns data directly via interceptor
        const res = await axiosClient.post<TokenAdmin>(
            apiUrl(`/api/auth/login-admin`),
            data
        ) as unknown as TokenAdmin;
        return res;
    },
    async postChangePassword(data: { currentPassword: string; newPassword: string; confirmNewPassword: string }): Promise<{ message: string }>
    {
        const res = await axiosClient.post<{ message: string }>(
            apiUrl(`/api/auth/change-password`),
            data
        ) as unknown as { message: string };
        return res;
    },
    
    async postLoginGoogleIdToken(idToken: string): Promise<resLoginUser> {
        const res = await axiosClient.post<resLoginUser>(
            apiUrl(`/api/auth/login-google`),
            { idToken }
        ) as unknown as resLoginUser;
        return res;
    },

    async postLoginGoogleCode(data: { code: string; redirectUri: string }): Promise<resLoginUser> {
        const res = await axiosClient.post<resLoginUser>(
            apiUrl(`/api/auth/login-google-code`),
            data
        ) as unknown as resLoginUser;
        return res;
    },

    async postCompleteProfile(data: { name?: string; phone?: string; password_hash?: string; gender?: 'male' | 'female' | 'other'; dateOfBirth?: string; avatarUrl?: string; address?: string; }): Promise<{ message: string; user: any }> {
        const res = await axiosClient.post<{ message: string; user: any }>(
            apiUrl(`/api/auth/complete-profile`),
            data
        ) as unknown as { message: string; user: any };
        return res;
    },

    async postLoginUser(data: LoginUserRequest): Promise<resLoginUser> {
        const res = await axiosClient.post<resLoginUser>(
            apiUrl(`/api/auth/login`),
            data
        ) as unknown as resLoginUser;
        return res;
    },

    async postRegisterUser(data: RegisterUserRequest): Promise<resRegisterUser> {
        const res = await axiosClient.post<resRegisterUser>(
            apiUrl(`/api/auth/register`),
            data
        ) as unknown as resRegisterUser;
        return res; 
    },

    async postStartRegisterPhone(data: { phone: string }): Promise<{ message: string; expiresAt?: string }>
    {
        const res = await axiosClient.post<{ message: string; expiresAt?: string }>(
            apiUrl(`/api/auth/start-register-phone`),
            data
        ) as unknown as { message: string; expiresAt?: string };
        return res;
    },

    async postVerifyPhone(data: { phone: string; code: string }): Promise<resLoginUser> {
        const res = await axiosClient.post<resLoginUser>(
            apiUrl(`/api/auth/verify-phone`),
            data
        ) as unknown as resLoginUser;
        return res;
    },
    
    async postVerifyEmail(data: { email: string; code: string }): Promise<{ message: string }> {
        const res = await axiosClient.post<{ message: string }>(
            apiUrl(`/api/auth/verify-email`),
            data
        ) as unknown as { message: string };
        return res;
    },

    // Forgot / Reset password
    async postForgotPassword(data: { email: string }): Promise<{ message: string }> {
        const res = await axiosClient.post<{ message: string }>(
            apiUrl(`/api/auth/forgot-password`),
            data
        ) as unknown as { message: string };
        return res;
    },

    async postResetPassword(data: { token: string; newPassword: string; confirmNewPassword: string }): Promise<{ message: string }> {
        const res = await axiosClient.post<{ message: string }>(
            apiUrl(`/api/auth/reset-password`),
            data
        ) as unknown as { message: string };
        return res;
    },
    /**
     * Yêu cầu gửi OTP xác thực email tới người dùng hiện tại (cần JWT)
     */
    async postRequestEmailVerification(): Promise<{ message: string }> {
        const res = await axiosClient.post<{ message: string }>(
            apiUrl(`/api/auth/request-email-verification`),
            {}
        ) as unknown as { message: string };
        return res;
    },
        
    async getMe(): Promise<Me> {
        const res = await axiosClient.get<Me>(
            apiUrl(`/api/auth/me`)
        ) as unknown as Me;
        return res; 
    },

    async listAdminUsers(params?: any): Promise<{ data: User[]; meta: any }> {
        try {
            const payload = await axiosClient.get<any, any>(apiUrl(`/api/admin/users`), { params });
            return { data: payload?.data ?? [], meta: payload?.meta ?? {} };
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 403) {
                console.warn('listAdminUsers: request forbidden (403) — user may not have admin rights');
                return { data: [], meta: {} };
            }
            throw err;
        }
    },
    async getAdminUser(id: number): Promise<User> {
        const res = await axiosClient.get<any>(apiUrl(`/api/admin/users/${id}`));
        return (res?.data ?? res) as User;
    },
    async createAdminUser(data: { email: string; password?: string; role?: 'customer'|'host'|'admin'; name?: string; phone?: string; ownerId?: number; note?: string; gender?: string; avatar?: string | null; idCardFront?: string | null; idCardBack?: string | null; dateOfBirth?: string | null; idCardNumber?: string; idIssueDate?: string | null; idIssuePlace?: string | null; address?: string }): Promise<User> {
        const res = await axiosClient.post<any>(apiUrl(`/api/admin/users`), data);
        return (res?.data ?? res) as User;
    },
    async updateAdminUser(id: number, data: { email?: string; password?: string; role?: 'customer'|'host'|'admin'; name?: string; phone?: string; ownerId?: number; note?: string; gender?: string; avatar?: string | null; idCardFront?: string | null; idCardBack?: string | null; dateOfBirth?: string | null; customerStatus?: 'new'|'appointment'|'sales'|'deposit_form'|'contract'|'failed'; idCardNumber?: string; idIssueDate?: string | null; idIssuePlace?: string | null; address?: string }): Promise<User> {
        const res = await axiosClient.patch<any>(apiUrl(`/api/admin/users/${id}`), data);
        return (res?.data ?? res) as User;
    },
    async deleteAdminUser(id: number): Promise<{ deleted: boolean }> {
        const res = await axiosClient.delete<any>(apiUrl(`/api/admin/users/${id}`));
        return (res?.data ?? res) as { deleted: boolean };
    },
};
