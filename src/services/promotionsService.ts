import axiosClient from "@/utils/axiosClient";

const promotionsService = {
    // Host/Admin
    create: async (data: any) => {
        return axiosClient.post('/promotions', data) as Promise<any>;
    },
    findAll: async () => {
        return axiosClient.get('/promotions') as Promise<any>;
    },
    // Resident
    findActive: async () => {
        return axiosClient.get('/promotions/active') as Promise<any>;
    },
    check: async (code: string) => {
        return axiosClient.post('/promotions/check', { code }) as Promise<any>;
    }
};

export default promotionsService;
