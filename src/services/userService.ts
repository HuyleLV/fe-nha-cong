// services/userService.ts
import axiosClient from "@/utils/axiosClient";
import { Me, User, resLoginUser } from "@/type/user";
import { LoginAdminRequest, LoginUserRequest, RegisterUserRequest, resRegisterUser } from "@/type/user";

export interface TokenAdmin {
    message: string,
    accessToken: string,
    expiresIn: string
}

export const userService = {
    async postLoginAdmin(data: LoginAdminRequest): Promise<TokenAdmin> {
        // axiosClient returns data directly via interceptor
        const res = await axiosClient.post<TokenAdmin>(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login-admin`,
            data
        ) as unknown as TokenAdmin;
        return res;
    },

    async postLoginUser(data: LoginUserRequest): Promise<resLoginUser> {
        const res = await axiosClient.post<resLoginUser>(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
            data
        ) as unknown as resLoginUser;
        return res;
    },

    async postRegisterUser(data: RegisterUserRequest): Promise<resRegisterUser> {
        const res = await axiosClient.post<resRegisterUser>(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
            data
        ) as unknown as resRegisterUser;
        return res; 
    },
        
    async getMe(): Promise<Me> {
        const res = await axiosClient.get<Me>(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`
        ) as unknown as Me;
        return res; 
    },

    async getById(id: string): Promise<User> {
        const payload = await axiosClient.get<any, any>(`/users/${id}`);
        return (payload?.data ?? payload) as User;
    },
    async create(data: Partial<User>): Promise<User> {
        const payload = await axiosClient.post<any, any>("/users", data);
        return (payload?.data ?? payload) as User;
    },
    async update(id: string, data: Partial<User>): Promise<User> {
        const payload = await axiosClient.put<any, any>(`/users/${id}`, data);
        return (payload?.data ?? payload) as User;
    },
    async delete(id: string): Promise<{ success?: boolean } | null> {
        const payload = await axiosClient.delete<any, any>(`/users/${id}`);
        return (payload?.data ?? payload) ?? null;
    },
};
