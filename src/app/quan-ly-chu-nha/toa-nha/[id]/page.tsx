"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Link from "next/link";
import { ArrowLeft, Save, Building as BuildingIcon, MapPin, CheckCircle2 } from "lucide-react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import { buildingService } from "@/services/buildingService";
import { locationService } from "@/services/locationService";
import type { Building, BuildingForm } from "@/type/building";
import type { Location } from "@/type/location";
import Spinner from "@/components/spinner";

const inputCls = "w-full min-h-[42px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-all";
const labelCls = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

export default function BuildingFormPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const isCreate = id === "create";

    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<BuildingForm>();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                // Load locations (Districts)
                const locRes = await locationService.getAll({ level: "District", limit: 100 });
                setLocations(locRes.items || []);

                if (!isCreate) {
                    const building = await buildingService.getById(Number(id));
                    setValue("name", building.name);
                    setValue("address", building.address ?? "");
                    setValue("slug", building.slug);
                    setValue("locationId", building.locationId ?? undefined);
                    setValue("description", building.description ?? "");
                    // Additional fields if any
                }
            } catch (e: any) {
                if (!isCreate) {
                    toast.error("Không tìm thấy tòa nhà");
                    router.push("/quan-ly-chu-nha/toa-nha");
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isCreate, router, setValue]);

    const onSubmit = async (data: BuildingForm) => {
        try {
            // Fix types (convert strings to numbers for selects if needed)
            const payload: BuildingForm = {
                ...data,
                locationId: data.locationId ? Number(data.locationId) : undefined,
            };

            if (isCreate) {
                await buildingService.create(payload);
                toast.success("Tạo tòa nhà thành công");
            } else {
                await buildingService.update(Number(id), payload);
                toast.success("Cập nhật tòa nhà thành công");
            }
            router.push("/quan-ly-chu-nha/toa-nha");
        } catch (e: any) {
            toast.error(e?.message || "Có lỗi xảy ra");
        }
    };

    if (loading) return <div className="h-96 grid place-items-center"><Spinner /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/quan-ly-chu-nha/toa-nha" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {isCreate ? "Thêm tòa nhà mới" : "Chỉnh sửa tòa nhà"}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {isCreate ? "Tạo tòa nhà để bắt đầu quản lý phòng trọ" : "Cập nhật thông tin tòa nhà"}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                                <BuildingIcon className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Thông tin chung</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Tên tòa nhà *</label>
                                    <input
                                        {...register("name", { required: "Vui lòng nhập tên tòa nhà" })}
                                        className={inputCls}
                                        placeholder="Ví dụ: Chung cư mini Xanh..."
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className={labelCls}>Mô tả</label>
                                    <textarea
                                        {...register("description")}
                                        className={`${inputCls} h-32 py-3`}
                                        placeholder="Mô tả về tiện ích, quy định..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                                <MapPin className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Vị trí & Địa chỉ</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Địa chỉ chi tiết *</label>
                                    <input
                                        {...register("address")}
                                        className={inputCls}
                                        placeholder="Số nhà, tên đường..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Khu vực (Quận/Huyện)</label>
                                        <select
                                            {...register("locationId")}
                                            className={inputCls}
                                        >
                                            <option value="">-- Chọn khu vực --</option>
                                            {locations.map(loc => (
                                                <option key={loc.id} value={loc.id}>
                                                    {loc.name}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-slate-500 mt-1">Liên kết phòng với khu vực để khách dễ tìm kiếm.</p>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Slug (URL thân thiện)</label>
                                        <input
                                            {...register("slug")}
                                            className={`${inputCls} bg-slate-50 dark:bg-slate-800/50`}
                                            placeholder="Tu dong tao tu ten..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-24">
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Hành động</h3>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:shadow-none"
                            >
                                {isSubmitting ? <Spinner className="w-5 h-5 border-white" /> : <Save className="w-5 h-5" />}
                                <span>{isCreate ? "Tạo tòa nhà" : "Lưu thay đổi"}</span>
                            </button>

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="w-full py-2.5 px-4 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
