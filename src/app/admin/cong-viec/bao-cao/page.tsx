"use client";

import { useEffect, useState } from "react";
import { taskService } from "@/services/taskService";
import { CheckCircle, Clock, AlertCircle, List } from "lucide-react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function TaskReportPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await taskService.getReports();
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Đang tải báo cáo...</div>;
    if (!data) return <div className="p-8 text-center text-slate-500">Không có dữ liệu</div>;

    const { stats, staffPerformance, completionRate } = data;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Báo cáo hiệu suất công việc</h1>
                <p className="text-slate-500">Theo dõi tiến độ và năng suất làm việc của đội ngũ</p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Tổng công việc" value={stats.total} icon={<List className="text-blue-600" />} color="bg-blue-50" />
                <StatCard title="Hoàn thành" value={stats.done} icon={<CheckCircle className="text-emerald-600" />} color="bg-emerald-50" />
                <StatCard title="Đang chờ" value={stats.pending} icon={<Clock className="text-orange-600" />} color="bg-orange-50" />
                <StatCard title="Quá hạn" value={stats.overdue} icon={<AlertCircle className="text-red-600" />} color="bg-red-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Completion Rate Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center">
                    <h3 className="w-full text-lg font-bold text-slate-800 mb-6">Tỷ lệ hoàn thành</h3>
                    <div className="w-48 h-48">
                        <CircularProgressbar
                            value={completionRate}
                            text={`${Math.round(completionRate)}%`}
                            styles={buildStyles({
                                textSize: '16px',
                                pathColor: `rgba(16, 185, 129, ${completionRate / 100})`,
                                textColor: '#1e293b',
                                trailColor: '#d6d6d6',
                                backgroundColor: '#3e98c7',
                            })}
                        />
                    </div>
                    <p className="mt-4 text-center text-slate-500 text-sm">
                        Tính trên tổng số công việc đã giao. <br />
                        Mục tiêu: trêm 80%
                    </p>
                </div>

                {/* Staff Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800">Hiệu suất nhân viên</h3>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-slate-600 font-semibold">Nhân viên</th>
                                <th className="px-6 py-3 text-slate-600 font-semibold text-center">Đã xong</th>
                                <th className="px-6 py-3 text-slate-600 font-semibold text-center">Quá hạn</th>
                                <th className="px-6 py-3 text-slate-600 font-semibold text-right">Tỷ lệ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {staffPerformance.map((s: any, i: number) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{s.name || 'Unassigned'}</td>
                                    <td className="px-6 py-3 text-center text-emerald-600">{s.done}</td>
                                    <td className="px-6 py-3 text-center text-red-600">{s.overdue}</td>
                                    <td className="px-6 py-3 text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${s.rate >= 80 ? 'bg-emerald-100 text-emerald-700' : s.rate >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                            {Math.round(s.rate)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className={`p-4 rounded-full ${color}`}>
                {icon}
            </div>
        </div>
    )
}
