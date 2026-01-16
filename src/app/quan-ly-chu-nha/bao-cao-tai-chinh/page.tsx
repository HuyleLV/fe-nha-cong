"use client";

import { useEffect, useState } from "react";
import { Download, Calendar, Filter, PieChart, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

import { landlordDashboardService, RevenueChartItem } from "@/services/landlordDashboardService";
import CashFlowChart from "@/components/charts/CashFlowChart";

export default function FinancialReportPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<RevenueChartItem[]>([]);

    // Quick filters: 'this_month', 'last_month', 'this_year', 'custom'
    const [filterType, setFilterType] = useState('this_year');
    const [startDate, setStartDate] = useState(dayjs().startOf('year').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dayjs().endOf('year').format('YYYY-MM-DD'));

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);

    const handleQuickFilter = (type: string) => {
        setFilterType(type);
        const now = dayjs();
        let start = now;
        let end = now;

        switch (type) {
            case 'this_month':
                start = now.startOf('month');
                end = now.endOf('month');
                break;
            case 'last_month':
                start = now.subtract(1, 'month').startOf('month');
                end = now.subtract(1, 'month').endOf('month');
                break;
            case 'last_3_months':
                start = now.subtract(3, 'month');
                break;
            case 'this_year':
                start = now.startOf('year');
                end = now.endOf('year');
                break;
        }
        setStartDate(start.format('YYYY-MM-DD'));
        setEndDate(end.format('YYYY-MM-DD'));
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await landlordDashboardService.getRevenueReport(startDate, endDate);
            setData(res.items || []);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải báo cáo tài chính");
        } finally {
            setLoading(false);
        }
    };

    const exportExcel = () => {
        if (!data.length) return toast.warning("Không có dữ liệu để xuất");

        const exportData = data.map(item => ({
            "Kỳ": item.period,
            "Doanh thu": item.revenue,
            "Chi phí": item.expense,
            "Lợi nhuận": item.profit
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Báo cáo tài chính");

        // Auto width
        const wscols = [
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 }
        ];
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, `Bao_Cao_Tai_Chinh_${startDate}_${endDate}.xlsx`);
        toast.success("Xuất file thành công!");
    };

    // Totals
    const totalRev = data.reduce((acc, c) => acc + c.revenue, 0);
    const totalExp = data.reduce((acc, c) => acc + c.expense, 0);
    const totalProfit = totalRev - totalExp;

    return (
        <div className="max-w-screen-2xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Báo cáo tài chính</h1>
                    <p className="text-slate-500">Theo dõi dòng tiền, doanh thu và lợi nhuận</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => { setStartDate(e.target.value); setFilterType('custom'); }}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-green-500"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => { setEndDate(e.target.value); setFilterType('custom'); }}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-green-500"
                    />
                    <button
                        onClick={exportExcel}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" /> Xuất Excel
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 text-sm">
                {[
                    { id: 'this_month', label: 'Tháng này' },
                    { id: 'last_month', label: 'Tháng trước' },
                    { id: 'last_3_months', label: '3 tháng qua' },
                    { id: 'this_year', label: 'Năm nay' },
                ].map(ft => (
                    <button
                        key={ft.id}
                        onClick={() => handleQuickFilter(ft.id)}
                        className={`px-3 py-1.5 rounded-full border transition-colors ${filterType === ft.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        {ft.label}
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Tổng doanh thu"
                    value={totalRev}
                    icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
                    bgIcon="bg-emerald-50"
                    color="text-emerald-600"
                />
                <StatsCard
                    title="Tổng chi phí"
                    value={totalExp}
                    icon={<TrendingDown className="w-6 h-6 text-red-600" />}
                    bgIcon="bg-red-50"
                    color="text-red-600"
                />
                <StatsCard
                    title="Lợi nhuận ròng"
                    value={totalProfit}
                    icon={<DollarSign className="w-6 h-6 text-blue-600" />}
                    bgIcon="bg-blue-50"
                    color="text-blue-600"
                />
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-slate-500" />
                        Biểu đồ dòng tiền
                    </h3>
                </div>
                {loading ? (
                    <div className="h-80 flex items-center justify-center text-slate-400">Đang tải dữ liệu...</div>
                ) : data.length > 0 ? (
                    <CashFlowChart data={data} />
                ) : (
                    <div className="h-80 flex items-center justify-center text-slate-400 flex-col gap-2">
                        <Filter className="w-8 h-8 opacity-20" />
                        Không có dữ liệu trong khoảng thời gian này
                    </div>
                )}
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">Kỳ (Thời gian)</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Doanh thu</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Chi phí</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Lợi nhuận</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{item.period}</td>
                                <td className="px-6 py-4 text-emerald-600 text-right font-medium">+{item.revenue.toLocaleString('vi-VN')}</td>
                                <td className="px-6 py-4 text-red-500 text-right">-{item.expense.toLocaleString('vi-VN')}</td>
                                <td className={`px-6 py-4 text-right font-bold ${item.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {item.profit.toLocaleString('vi-VN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, bgIcon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className={`text-2xl font-bold ${color}`}>{value.toLocaleString('vi-VN')} <span className="text-sm font-normal text-slate-400">đ</span></h3>
            </div>
            <div className={`p-3 rounded-xl ${bgIcon}`}>
                {icon}
            </div>
        </div>
    )
}
