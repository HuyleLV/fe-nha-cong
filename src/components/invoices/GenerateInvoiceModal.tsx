'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { rentCalculationService } from '@/services/rentCalculationService';

interface GenerateInvoiceModalProps {
    onClose: () => void;
    onSuccess: () => void;
    contractId?: number; // Optional: pre-select contract if known
}

export default function GenerateInvoiceModal({ onClose, onSuccess, contractId }: GenerateInvoiceModalProps) {
    const [selectedContractId, setSelectedContractId] = useState<string>(contractId ? String(contractId) : '');
    const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedContractId || !period) {
            toast.error('Vui lòng nhập ID hợp đồng và kỳ thanh toán');
            return;
        }

        setLoading(true);
        try {
            await rentCalculationService.calculateAndCreateInvoice(Number(selectedContractId), period);
            toast.success('Đã tạo hóa đơn thành công!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to generate invoice:', error);
            toast.error(error?.response?.data?.message || 'Lỗi khi tạo hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Tạo Hóa Đơn Thủ Công</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Hợp Đồng</label>
                        <input
                            type="number"
                            value={selectedContractId}
                            onChange={(e) => setSelectedContractId(e.target.value)}
                            placeholder="Nhập ID hợp đồng"
                            className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ Thanh Toán (Tháng)</label>
                        <input
                            type="month"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
                        Hệ thống sẽ tự động tính toán tiền thuê, điện, nước và dịch vụ khác dựa trên chỉ số điện nước đã nhập cho kỳ này.
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Đang xử lý...' : 'Tạo Hóa Đơn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
