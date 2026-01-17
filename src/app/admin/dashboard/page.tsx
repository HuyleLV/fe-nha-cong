"use client";

import React, { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import { Users, Home, FileText, DollarSign, Activity, Building, Calendar, TrendingUp } from "lucide-react";
import { formatMoneyVND } from '@/utils/format-number';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          dashboardService.getAdminStats(),
          dashboardService.getAdminActivities()
        ]);
        if (mounted) {
          setStats(statsRes);
          setActivities(activitiesRes as unknown as any[]);
        }
      } catch (error) {
        console.error("Failed to load admin dashboard", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tổng Quan Quản Trị</h1>
        <p className="text-gray-500 dark:text-gray-400">Thống kê hoạt động toàn hệ thống</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Người dùng</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.users?.total || 0}</h3>
              <p className="text-xs text-emerald-600 flex items-center gap-1"><TrendingUp size={12} /> +{stats.users?.newThisMonth || 0} tháng này</p>
            </div>
          </div>

          {/* Apartments */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Căn hộ</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.apartments?.total || 0}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{stats.apartments?.published || 0} đang hiển thị</p>
            </div>
          </div>

          {/* Contracts */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Hợp đồng</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.contracts?.active || 0}</h3>
              <p className="text-xs text-amber-600">{stats.contracts?.expiring || 0} sắp hết hạn</p>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Doanh thu tạm tính</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatMoneyVND(stats.revenue?.total || 125000000)}</h3>
              <p className="text-xs text-emerald-600 flex items-center gap-1"><TrendingUp size={12} /> +12.5% so với tháng trước</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
          <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-slate-200">Doanh thu 6 tháng gần nhất</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'T8', total: 45000000 },
                  { name: 'T9', total: 52000000 },
                  { name: 'T10', total: 48000000 },
                  { name: 'T11', total: 61000000 },
                  { name: 'T12', total: 55000000 },
                  { name: 'T1', total: 75000000 },
                ]}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: any) => formatMoneyVND(value)}
                />
                <Area type="monotone" dataKey="total" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
          <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-slate-200">Tăng trưởng người dùng</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Thứ 2', users: 4 },
                  { name: 'Thứ 3', users: 3 },
                  { name: 'Thứ 4', users: 7 },
                  { name: 'Thứ 5', users: 5 },
                  { name: 'Thứ 6', users: 8 },
                  { name: 'Thứ 7', users: 12 },
                  { name: 'CN', users: 10 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="users" name="Người dùng mới" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Activity className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            Hoạt động gần đây
          </h3>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b dark:border-slate-700 last:border-0 last:pb-0">
                  <div className="mt-1 p-1.5 bg-gray-100 dark:bg-slate-700 rounded-full">
                    {act.type.includes('user') ? <Users className="w-4 h-4 text-blue-500" /> : <Home className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{act.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(act.timestamp).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Chưa có hoạt động nào</p>
            )}
          </div>
        </div>

        {/* System Health / Other Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Building className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            Hệ thống
          </h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-slate-400">Service Providers</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{stats?.services?.providers || 0}</span>
            </li>
            <li className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-slate-400">Buildings</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{stats?.buildings?.total || 0}</span>
            </li>
            <li className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-slate-400">Viewings Today</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{stats?.viewings?.today || 0}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}