"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Save, CheckCircle2, Info, ChevronRight, User as UserIcon, Calendar, MapPin, CreditCard, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

import { userService } from "@/services/userService";
import type { User } from "@/type/user";
import Spinner from "@/components/spinner";

// Definition of fields
type FormValues = {
    name?: string;
    email: string;
    phone?: string;
    gender?: "male" | "female" | "other";
    dateOfBirth?: string; // YYYY-MM-DD
    address?: string;
    idCardNumber?: string;
    idIssueDate?: string;
    idIssuePlace?: string;
    note?: string;
    // images (display only or specialized upload)
};

const inputCls =
    "h-10 w-full rounded-lg border border-slate-300/80 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 transition-colors";
const textMuted = "text-sm text-slate-600 dark:text-slate-300";

const Section = ({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/50">
            {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

export default function AdminResidentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [userData, setUserData] = useState<User | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, dirtyFields },
    } = useForm<FormValues>();

    useEffect(() => {
        if (!id || id === 'create') return; // Only support editing existing for now
        (async () => {
            try {
                const u = await userService.getAdminUser(Number(id));
                setUserData(u);
                reset({
                    name: u.name ?? "",
                    email: u.email ?? "",
                    phone: u.phone ?? "",
                    gender: u.gender as any,
                    dateOfBirth: u.dateOfBirth ? dayjs(u.dateOfBirth).format("YYYY-MM-DD") : "",
                    address: u.address ?? "",
                    idCardNumber: u.idCardNumber ?? "",
                    idIssueDate: u.idIssueDate ? dayjs(u.idIssueDate).format("YYYY-MM-DD") : "",
                    idIssuePlace: u.idIssuePlace ?? "",
                    note: u.note ?? "",
                });
            } catch (e: any) {
                console.error(e);
                toast.error("Không tìm thấy thông tin cư dân");
                // router.push("/admin/khach-hang/cu-dan"); 
            } finally {
                setLoading(false);
            }
        })();
    }, [id, reset, router]);

    async function onSubmit(values: FormValues) {
        try {
            const payload = {
                name: values.name,
                email: values.email, // Read only usually?
                phone: values.phone,
                gender: values.gender,
                dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : null,
                address: values.address,
                idCardNumber: values.idCardNumber,
                idIssueDate: values.idIssueDate ? new Date(values.idIssueDate) : null,
                idIssuePlace: values.idIssuePlace,
                note: values.note,
            };

            await userService.updateAdminUser(Number(id), payload);
            toast.success("Cập nhật thông tin thành công");
            router.refresh();
        } catch (e) {
            toast.error("Cập nhật thất bại");
        }
    }

    if (loading) return <div className="h-screen grid place-items-center"><Spinner /></div>;

    return (
        <div className="mx-auto max-w-5xl p-6">
            {/* Header - Sticky */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md mb-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/khach-hang/cu-dan" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {userData?.name || "Chi tiết cư dân"}
                        </h1>
                        <p className="text-sm text-slate-500">Quản lý thông tin hồ sơ cư dân</p>
                    </div>
                </div>

                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting || Object.keys(dirtyFields).length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    {isSubmitting ? <Spinner className="w-4 h-4 border-white" /> : <Save className="w-4 h-4" />}
                    <span>Lưu thay đổi</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Core Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Section title="Thông tin cá nhân" icon={UserIcon}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-2">
                                <label className={textMuted}>Họ và tên</label>
                                <input className={inputCls} {...register("name")} placeholder="Nhập họ tên đầy đủ" />
                            </div>
                            <div>
                                <label className={textMuted}>Số điện thoại</label>
                                <input className={inputCls} {...register("phone")} placeholder="090..." />
                            </div>
                            <div>
                                <label className={textMuted}>Email</label>
                                <input className={inputCls} {...register("email")} disabled readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
                            </div>
                            <div>
                                <label className={textMuted}>Giới tính</label>
                                <select className={inputCls} {...register("gender")}>
                                    <option value="">-- Chọn --</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            <div>
                                <label className={textMuted}>Ngày sinh</label>
                                <input type="date" className={inputCls} {...register("dateOfBirth")} />
                            </div>
                        </div>
                    </Section>

                    <Section title="Giấy tờ tùy thân (CCCD/CMND)" icon={CreditCard}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                            <div>
                                <label className={textMuted}>Số CCCD</label>
                                <input className={inputCls} {...register("idCardNumber")} placeholder="Số căn cước..." />
                            </div>
                            <div>
                                <label className={textMuted}>Ngày cấp</label>
                                <input type="date" className={inputCls} {...register("idIssueDate")} />
                            </div>
                            <div className="col-span-2">
                                <label className={textMuted}>Nơi cấp</label>
                                <input className={inputCls} {...register("idIssuePlace")} placeholder="Cục CS QLHC..." />
                            </div>
                        </div>

                        {/* Images Display */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 aspect-video flex items-center justify-center relative group overflow-hidden">
                                {userData?.idCardFront ? (
                                    <img src={userData.idCardFront} alt="Mặt trước" className="w-full h-full object-contain" />
                                ) : <span className="text-xs text-slate-400">Chưa có ảnh mặt trước</span>}
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 aspect-video flex items-center justify-center relative group overflow-hidden">
                                {userData?.idCardBack ? (
                                    <img src={userData.idCardBack} alt="Mặt sau" className="w-full h-full object-contain" />
                                ) : <span className="text-xs text-slate-400">Chưa có ảnh mặt sau</span>}
                            </div>
                        </div>
                    </Section>
                </div>

                {/* Right Column - Additional Info */}
                <div className="space-y-8">
                    <Section title="Địa chỉ & Ghi chú" icon={MapPin}>
                        <div className="space-y-4">
                            <div>
                                <label className={textMuted}>Địa chỉ thường trú</label>
                                <textarea className={`${inputCls} h-24 py-2`} {...register("address")} placeholder="Địa chỉ hiện tại..." />
                            </div>
                            <div>
                                <label className={textMuted}>Ghi chú nội bộ</label>
                                <textarea className={`${inputCls} h-32 py-2`} {...register("note")} placeholder="Ghi chú về cư dân này..." />
                            </div>
                        </div>
                    </Section>

                    {/* Metadata Card */}
                    <div className="p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Thông tin hệ thống</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Mã cư dân</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">#{userData?.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Ngày tạo</span>
                                <span className="text-slate-700 dark:text-slate-300">{userData?.createdAt ? dayjs(userData.createdAt).format("DD/MM/YYYY HH:mm") : "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Trạng thái</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${userData?.customerStatus === 'contract' ? 'bg-emerald-100 text-emerald-700' :
                                        'bg-slate-100 text-slate-700'
                                    }`}>
                                    {userData?.customerStatus || "Mới"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
