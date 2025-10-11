"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { partnerService } from "@/services/partnerService";
import type { PartnerForm, PartnerRole } from "@/type/partners";
import { toast } from "react-toastify";

export default function HopTacPage() {
    const [role, setRole] = React.useState<PartnerRole>("landlord");
    const [submitting, setSubmitting] = React.useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
    } = useForm<PartnerForm>({
        shouldUnregister: true,
        defaultValues: { role: "landlord" },
    });

    const onPickRole = (r: PartnerRole) => {
        setRole(r);
        setValue("role", r, { shouldValidate: true });
    };

    const onSubmit = async (data: PartnerForm) => {
        try {
            setSubmitting(true);
            await partnerService.create(data);
            reset({ role }); 
            toast.success("Đã gửi thông tin thành công!");
        } catch (e: any) {
            toast.error(e?.message || "Gửi thất bại. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
            <h1 className="text-2xl font-bold text-center text-emerald-900">Hợp tác cùng chúng tôi</h1>
            <p className="text-center text-slate-600 mt-2">Chủ nhà • Khách hàng • Đơn vị vận hành</p>

            {/* Tabs vai trò */}
            <div className="grid grid-cols-3 gap-2 mt-6">
                {([
                    { id: "landlord", label: "Chủ nhà" },
                    { id: "customer", label: "Khách hàng" },
                    { id: "operator", label: "Đơn vị vận hành" },
                ] as const).map((r) => (
                    <button
                        key={r.id}
                        type="button"
                        onClick={() => onPickRole(r.id)}
                        className={`rounded-xl px-3 py-2 text-sm border transition cursor-pointer ${
                            role === r.id
                            ? "border-emerald-500 bg-white shadow ring-2 ring-emerald-200"
                            : "border-slate-300 bg-white/70 hover:border-emerald-300"
                        }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* hidden role để submit */}
            <input type="hidden" {...register("role")} />

            <label className="block">
                <span className="block mb-1 text-sm font-medium text-slate-700">Họ và tên</span>
                <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="Nguyễn Văn A"
                {...register("fullName", { required: "Vui lòng nhập họ tên" })}
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
            </label>

            <label className="block">
                <span className="block mb-1 text-sm font-medium text-slate-700">Số điện thoại</span>
                <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="09xx xxx xxx"
                {...register("phone", { required: "Vui lòng nhập SĐT" })}
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
            </label>

            <label className="block">
                <span className="block mb-1 text-sm font-medium text-slate-700">Email</span>
                <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="you@example.com"
                type="email"
                {...register("email", { required: "Vui lòng nhập email" })}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </label>

            {role === "landlord" && (
                <label className="block">
                <span className="block mb-1 text-sm font-medium text-slate-700">Số lượng tài sản</span>
                <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    placeholder="VD: 3"
                    type="number"
                    {...register("propertyCount", { required: "Nhập số lượng" })}
                />
                {errors.propertyCount && <p className="text-xs text-red-600 mt-1">{String(errors.propertyCount.message)}</p>}
                </label>
            )}

            {role === "customer" && (
                <label className="block">
                <span className="block mb-1 text-sm font-medium text-slate-700">Ngân sách (VND)</span>
                <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    placeholder="VD: 6.000.000"
                    type="number"
                    {...register("budget", { required: "Nhập ngân sách" })}
                />
                {errors.budget && <p className="text-xs text-red-600 mt-1">{String(errors.budget.message)}</p>}
                </label>
            )}

            {role === "operator" && (
                <label className="block">
                <span className="block mb-1 text-sm font-medium text-slate-700">Tên đơn vị</span>
                <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    placeholder="VD: ABC Property"
                    {...register("companyName", { required: "Nhập tên đơn vị" })}
                />
                {errors.companyName && <p className="text-xs text-red-600 mt-1">{errors.companyName.message}</p>}
                </label>
            )}

            <label className="block">
                <span className="block mb-1 text-sm font-medium text-slate-700">Ghi chú</span>
                <textarea
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                rows={3}
                placeholder="Nhu cầu, khu vực quan tâm…"
                {...register("note")}
                />
            </label>

            <div className="pt-4 text-right">
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                >
                    {submitting ? "Đang gửi…" : "Gửi thông tin"}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}
