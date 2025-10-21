"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { partnerService } from "@/services/partnerService";
import type { PartnerForm, PartnerRole } from "@/type/partners";
import { toast } from "react-toastify";

type LocalForm = {
  role: PartnerRole;
  fullName: string;
  phone: string;
  email: string;
  need: string;
};

const ROLE_OPTIONS = [
  { id: "landlord", label: "Chủ nhà" },
  { id: "customer", label: "Khách hàng" },
  { id: "operator", label: "Đơn vị vận hành" },
] as const;

export default function HopTacPage() {
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<LocalForm>({
    defaultValues: {
      role: "landlord",
    },
  });

  const role = watch("role");

  const onSubmit = async (data: LocalForm) => {
    try {
      setSubmitting(true);
      
      const payload: PartnerForm = {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        role: role,
        need: data.need
      };

      await partnerService.create(payload);
      reset({ role: "landlord", fullName: "", phone: "", email: "", need: "" });
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
        <h1 className="text-2xl font-bold text-center text-emerald-900">
          Hợp tác cùng chúng tôi
        </h1>
        <p className="text-center text-slate-600 mt-2">
          Chủ nhà • Khách hàng • Đơn vị vận hành
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Vai trò */}
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-slate-700">
              Vai trò
            </span>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              {...register("role", { required: "Vui lòng chọn vai trò" })}
              value={role}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-xs text-red-600 mt-1">
                {errors.role.message}
              </p>
            )}
          </label>

          {/* Họ và tên */}
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-slate-700">
              Họ và tên
            </span>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="Nguyễn Văn A"
              {...register("fullName", { required: "Vui lòng nhập họ tên" })}
            />
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </label>

          {/* Số điện thoại */}
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-slate-700">
              Số điện thoại
            </span>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="09xx xxx xxx"
              {...register("phone", { required: "Vui lòng nhập SĐT" })}
            />
            {errors.phone && (
              <p className="text-xs text-red-600 mt-1">
                {errors.phone.message}
              </p>
            )}
          </label>

          {/* Email */}
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-slate-700">
              Email
            </span>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="you@example.com"
              {...register("email", { required: "Vui lòng nhập email" })}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </label>

          {/* Nhu cầu */}
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-slate-700">
              Nhu cầu
            </span>
            <textarea
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              rows={4}
              placeholder="VD: Tôi có nhà trọ cần cho thuê, hoặc tôi đang tìm phòng tầm 5 triệu gần quận 7..."
              {...register("need", { required: "Vui lòng nhập nhu cầu" })}
            />
            {errors.need && (
              <p className="text-xs text-red-600 mt-1">
                {errors.need.message}
              </p>
            )}
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
