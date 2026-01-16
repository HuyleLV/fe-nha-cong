import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';

export interface RentCalculationResult {
    invoiceId: number;
    totalAmount: string;
    items: any[];
}

export const rentCalculationService = {
    /**
     * Calculate and create invoice for a contract manually
     */
    async calculateAndCreateInvoice(contractId: number, period: string) {
        const res = await axiosClient.post<any, RentCalculationResult>(
            apiUrl('/api/rent-calculation/calculate'),
            { contractId, period }
        );
        return res;
    },

    /**
     * Preview calculation without creating invoice (optional, if backend supports)
     */
    async previewCalculation(contractId: number, period: string) {
        const res = await axiosClient.post<any, any>(
            apiUrl('/api/rent-calculation/preview'),
            { contractId, period }
        );
        return res;
    }
};
