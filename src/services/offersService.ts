import axiosClient from "@/utils/axiosClient";

const offersService = {
    // Host/Admin
    create: async (data: any) => {
        return axiosClient.post('/offers', data) as Promise<any>;
    },
    update: async (id: number, data: any) => {
        return axiosClient.put(`/offers/${id}`, data) as Promise<any>;
    },
    remove: async (id: number) => {
        return axiosClient.delete(`/offers/${id}`) as Promise<any>;
    },
    findAll: async () => {
        return axiosClient.get('/offers') as Promise<any>;
    },
    findOne: async (id: number) => {
        return axiosClient.get(`/offers/${id}`) as Promise<any>;
    },
    // Resident
    findActive: async () => {
        return axiosClient.get('/offers/active') as Promise<any>;
    }
};

export default offersService;
