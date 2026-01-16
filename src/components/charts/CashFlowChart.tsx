"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";

interface CashFlowChartProps {
    data: any[];
}

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    return `${(value / 1000).toFixed(0)}k`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
                <p className="font-semibold mb-2">{label}</p>
                <div className="space-y-1">
                    <p className="text-emerald-600">Thu: {Number(payload[0]?.value || 0).toLocaleString('vi-VN')} đ</p>
                    <p className="text-red-500">Chi: {Number(payload[1]?.value || 0).toLocaleString('vi-VN')} đ</p>
                    <div className="border-t pt-1 mt-1">
                        <p className="font-bold text-blue-600">Lợi nhuận: {Number(payload[0].payload.profit || 0).toLocaleString('vi-VN')} đ</p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function CashFlowChart({ data }: CashFlowChartProps) {
    return (
        <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="period"
                        tick={{ fontSize: 12, fill: '#64748B' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 12, fill: '#64748B' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <ReferenceLine y={0} stroke="#CBD5E1" />

                    <Bar
                        dataKey="revenue"
                        name="Doanh thu"
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                    <Bar
                        dataKey="expense"
                        name="Chi phí"
                        fill="#EF4444"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
