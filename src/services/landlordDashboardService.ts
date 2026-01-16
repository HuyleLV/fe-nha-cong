import axiosClient from "@/utils/axiosClient";

export interface DashboardStats {
    revenue: {
        thisMonth: string;
        total: string;
    };
    expenses: {
        thisMonth: string;
    };
    profit: {
        thisMonth: string;
    };
    pendingPayments: string;
    activeContracts: number;
    expiringContracts: number;
    totalApartments: number;
    customers: {
        total: number;
        newThisMonth: number;
        potential: number;
        contracted: number;
    };
    tasks: {
        total: number;
        incomplete: number;
        overdue: number;
        completed: number;
    };
}

export interface RevenueChartItem {
    period: string; // YYYY-MM or YYYY-MM-DD
    revenue: number;
    expense: number;
    profit: number;
}

export const landlordDashboardService = {
    getStats: async () => {
        const data = await axiosClient.get<DashboardStats>("/landlord/dashboard/stats");
        return data;
    },

    getRevenueReport: async (from?: string, to?: string) => {
        const data = await axiosClient.get<{ items: RevenueChartItem[] }>("/landlord/dashboard/revenue", {
            params: { from, to },
        });
        return data;
    },

    getContracts: async (status?: string) => {
        const data = await axiosClient.get("/landlord/dashboard/contracts", {
            params: { status },
        });
        return data;
    },

    getUpcomingRent: async () => {
        const data = await axiosClient.get("/landlord/dashboard/rent/upcoming");
        return data;
    },

    getOverdue: async () => {
        const data = await axiosClient.get<any[]>("/landlord/dashboard/rent/overdue");
        return data;
    },
};
