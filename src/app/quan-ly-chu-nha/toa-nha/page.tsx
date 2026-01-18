"use client";

import React, { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import Link from 'next/link';
import { Plus, Building2, MapPin, Home, Edit3, Trash2, Search } from 'lucide-react';
import { buildingService } from "@/services/buildingService";
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ConfirmModal'; // Assuming global component
import Pagination from '@/components/Pagination'; // Assuming global component
import type { Building } from '@/type/building';

export default function MyBuildingsPage() {
    const [data, setData] = useState<Building[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [targetId, setTargetId] = useState<number | null>(null);

    const load = async (p = 1) => {
        setLoading(true);
        try {
            const res = await buildingService.getAll({ page: p, limit: 12 }); // 12 grid items
            setData(res.items);
            setTotal(res.meta.total);
            setPage(p);
        } catch (error) {
            console.error(error);
            toast.error("Không tải được danh sách tòa nhà");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(1);
    }, []);

    const onDelete = async () => {
        if (!targetId) return;
        try {
            await buildingService.remove(targetId);
            toast.success("Đã xóa tòa nhà");
            load(page);
        } catch (e) {
            toast.error("Không thể xóa tòa nhà này");
        } finally {
            setConfirmOpen(false);
            setTargetId(null);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <Panel title="Quản lý tòa nhà">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Danh sách tòa nhà</h2>
                        <p className="text-sm text-slate-500">Quản lý các tòa nhà, khu trọ của bạn</p>
                    </div>
                    <Link
                        href="/quan-ly-chu-nha/toa-nha/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Thêm tòa nhà</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                        ))}
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Bạn chưa có tòa nhà nào.</p>
                        <Link href="/quan-ly-chu-nha/toa-nha/create" className="text-emerald-600 font-medium hover:underline mt-2 inline-block">
                            Tạo tòa nhà ngay &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.map((item) => (
                            <div key={item.id} className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-emerald-500/50 transition-all overflow-hidden flex flex-col">
                                <div className="h-32 bg-slate-100 dark:bg-slate-900 relative">
                                    {/* Placeholder for image - or actual image if available */}
                                    <div className="absolute inset-0 grid place-items-center text-slate-300">
                                        <Building2 className="w-10 h-10" />
                                    </div>
                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {item.status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1" title={item.name}>
                                        {item.name}
                                    </h3>
                                    <div className="text-sm text-slate-500 mb-4 flex items-start gap-1 line-clamp-2 min-h-[40px]">
                                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{item.address || 'Chưa cập nhật địa chỉ'}</span>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                                            <span className="flex items-center gap-1" title="Số lượng phòng">
                                                <Home className="w-4 h-4" />
                                                <span className="font-semibold">{item.apartmentCount ?? 0}</span>
                                            </span>
                                            {/* Add more stats if needed */}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link href={`/quan-ly-chu-nha/toa-nha/${item.id}`} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Chỉnh sửa">
                                                <Edit3 className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => { setTargetId(item.id); setConfirmOpen(true); }}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {total > 12 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination page={page} limit={12} total={total} onPageChange={load} />
                    </div>
                )}
            </Panel>

            <ConfirmModal
                open={confirmOpen}
                title="Xóa tòa nhà"
                message="Bạn có chắc chắn muốn xóa tòa nhà này? Tất cả phòng trọ và dữ liệu liên quan có thể bị ảnh hưởng."
                onCancel={() => { setConfirmOpen(false); setTargetId(null); }}
                onConfirm={onDelete}
            />
        </div>
    );
}
