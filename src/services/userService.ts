// services/userService.ts
import axiosClient from "@/utils/axiosClient";
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
            `/auth/login-admin`,
            data
        ) as unknown as TokenAdmin;
        return res;
    },
    
    async postLoginGoogleIdToken(idToken: string): Promise<resLoginUser> {
        const res = await axiosClient.post<resLoginUser>(
            `/auth/login-google`,
            { idToken }
        ) as unknown as resLoginUser;
        return res;
    },

    async postLoginGoogleCode(data: { code: string; redirectUri: string }): Promise<resLoginUser> {
        const res = await axiosClient.post<resLoginUser>(
            `/auth/login-google-code`,
            data
        ) as unknown as resLoginUser;
        return res;
    },

    async postCompleteProfile(data: { name?: string; phone?: string; password_hash?: string; gender?: 'male' | 'female' | 'other'; dateOfBirth?: string; avatarUrl?: string; address?: string; }): Promise<{ message: string; user: any }> {
        const res = await axiosClient.post<{ message: string; user: any }>(
            `/auth/complete-profile`,
            data
        ) as unknown as { message: string; user: any };
        return res;
    },

    async postLoginUser(data: LoginUserRequest): Promise<resLoginUser> {
        const res = await axiosClient.post<resLoginUser>(
            `/auth/login`,
            data
        ) as unknown as resLoginUser;
        return res;
    },

    async postRegisterUser(data: RegisterUserRequest): Promise<resRegisterUser> {
        const res = await axiosClient.post<resRegisterUser>(
            `/auth/register`,
            data
        ) as unknown as resRegisterUser;
        return res; 
    },

    async postStartRegisterPhone(data: { phone: string }): Promise<{ message: string; expiresAt?: string }>
    {
        const res = await axiosClient.post<{ message: string; expiresAt?: string }>(
            `/auth/start-register-phone`,
            data
        ) as unknown as { message: string; expiresAt?: string };
        return res;
    },

    async postVerifyPhone(data: { phone: string; code: string }): Promise<resLoginUser> {
        const res = await axiosClient.post<resLoginUser>(
            `/auth/verify-phone`,
            data
        ) as unknown as resLoginUser;
        return res;
    },
    
    async postVerifyEmail(data: { email: string; code: string }): Promise<{ message: string }> {
        const res = await axiosClient.post<{ message: string }>(
            `/auth/verify-email`,
            data
        ) as unknown as { message: string };
        return res;
    },
        
    async getMe(): Promise<Me> {
        const res = await axiosClient.get<Me>(
            `/auth/me`
        ) as unknown as Me;
        return res; 
    },

    // ===== Admin Users Management =====
    async listAdminUsers(params?: { page?: number; limit?: number }): Promise<{ data: User[]; meta: any }> {
        const payload = await axiosClient.get<any, any>(`/admin/users`, { params });
        return { data: payload?.data ?? [], meta: payload?.meta ?? {} };
    },
    async getAdminUser(id: number): Promise<User> {
        const res = await axiosClient.get<any>(`/admin/users/${id}`);
        return (res?.data ?? res) as User;
    },
    async createAdminUser(data: { email: string; password?: string; role?: 'customer'|'host'|'admin' }): Promise<User> {
        const res = await axiosClient.post<any>(`/admin/users`, data);
        return (res?.data ?? res) as User;
    },
    async updateAdminUser(id: number, data: { email?: string; password?: string; role?: 'customer'|'host'|'admin' }): Promise<User> {
        const res = await axiosClient.patch<any>(`/admin/users/${id}`, data);
        return (res?.data ?? res) as User;
    },
    async deleteAdminUser(id: number): Promise<{ deleted: boolean }> {
        const res = await axiosClient.delete<any>(`/admin/users/${id}`);
        return (res?.data ?? res) as { deleted: boolean };
    },
};
