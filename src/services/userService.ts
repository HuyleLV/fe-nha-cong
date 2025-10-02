// services/userService.ts
import axiosClient from "@/utils/axiosClient";
import { Me, User } from "@/type/user";
import { LoginAdminRequest } from "@/type/user";

export interface TokenAdmin {
    accessToken: string,
    expiresIn: string
}

export const userService = {
    async postLoginAdmin(data: LoginAdminRequest): Promise<TokenAdmin> {
        const res = await axiosClient.post<TokenAdmin>(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login-admin`,
                data,
                { validateStatus: () => true } 
            );
            if (res.status != 201) {
                const msg = (res.data as any)?.message ?? `Login failed (${res.status})`;
                throw new Error(msg);
            }
            return res.data; 
        },
        
        // LẤY HỒ SƠ /auth/me
        async getMe(): Promise<Me> {
            const res = await axiosClient.get<Me>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
                { validateStatus: () => true }
            );
        
            if (res.status >= 400) {
                const msg = (res.data as any)?.message ?? `Unauthorized (${res.status})`;
                throw new Error(msg); 
            }
            return res.data; 
        },

    getById: (id: string) => axiosClient.get(`/users/${id}`),
    create: (data: any) => axiosClient.post("/users", data),
    update: (id: string, data: any) => axiosClient.put(`/users/${id}`, data),
    delete: (id: string) => axiosClient.delete(`/users/${id}`),
};
