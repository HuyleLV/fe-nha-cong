import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';

export const dashboardService = {
    // Admin Dashboard
    async getAdminStats() {
        const res = await axiosClient.get(apiUrl('/api/admin/dashboard/stats'));
        return res;
    },

    async getAdminActivities(limit = 10) {
        const res = await axiosClient.get(apiUrl('/api/admin/dashboard/activities'), { params: { limit } });
        return res;
    },

    async getAdminRevenueChart(period: 'week' | 'month' | 'year' = 'month') {
        const res = await axiosClient.get(apiUrl('/api/admin/dashboard/revenue'), { params: { period } });
        return res;
    },

    // Landlord Dashboard
    async getLandlordStats() {
        const res = await axiosClient.get(apiUrl('/api/landlord/dashboard/stats'));
        return res;
    },

    async getLandlordRevenueReport(from?: string, to?: string) {
        const res = await axiosClient.get(apiUrl('/api/landlord/dashboard/revenue'), { params: { from, to } });
        return res;
    },

    async getLandlordContracts(status?: string) {
        const res = await axiosClient.get(apiUrl('/api/landlord/dashboard/contracts'), { params: { status } });
        return res;
    },

    async getLandlordUpcomingRent() {
        const res = await axiosClient.get(apiUrl('/api/landlord/dashboard/rent/upcoming'));
        return res;
    },

    async getLandlordOverdueRent() {
        const res = await axiosClient.get(apiUrl('/api/landlord/dashboard/rent/overdue'));
        return res;
    },
};
