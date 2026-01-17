import axiosClient from "@/utils/axiosClient";

const pointsService = {
    getMyBalance: async () => {
        return axiosClient.get('/points/my-balance') as Promise<any>;
    },
    getMyHistory: async (page: number, limit: number) => {
        return axiosClient.get(`/points/my-history?page=${page}&limit=${limit}`) as Promise<any>;
    },
    // Host/Admin
    getUserPoints: async (userId: number) => {
        return axiosClient.get(`/points/user/${userId}`) as Promise<any>;
    },
    adjustPoints: async (data: { userId: number; amount: number; type?: string; description: string }) => {
        return axiosClient.post('/points/adjust', data) as Promise<any>;
    }
};

export default pointsService;
