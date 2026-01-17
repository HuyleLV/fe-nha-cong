import axiosClient from "@/utils/axiosClient";

export const financeService = {
    getCashFlow: async (startDate: string, endDate: string, buildingId?: number) => {
        return axiosClient.get('/finance/cash-flow', {
            params: { startDate, endDate, buildingId }
        }) as Promise<any>;
    },

    getProfitLoss: async (year: number, period?: string) => {
        return axiosClient.get('/finance/profit-loss', {
            params: { year, period }
        }) as Promise<any>;
    },

    getDebts: async (page = 1, limit = 20) => {
        return axiosClient.get('/finance/debts', {
            params: { page, limit }
        }) as Promise<any>;
    },

    getBrokerage: async (page = 1, limit = 20) => {
        return axiosClient.get('/finance/brokerage', {
            params: { page, limit }
        }) as Promise<any>;
    },

    getAssets: async () => {
        return axiosClient.get('/finance/assets') as Promise<any>;
    }
};

export default financeService;
