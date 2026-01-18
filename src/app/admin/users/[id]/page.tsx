"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Save, CheckCircle2, Info, ChevronRight, User as UserIcon, Calendar, MapPin, CreditCard, Lock, Key, Shield } from "lucide-react";
import dayjs from "dayjs";

import { userService } from "@/services/userService";
import type { User } from "@/type/user";
import Spinner from "@/components/spinner";

type FormValues = {
  name?: string;
  email: string;
  phone?: string;
  password?: string;
  role: User["role"]; // UI role: customer | host | admin
  gender?: "male" | "female" | "other";
  dateOfBirth?: string; // YYYY-MM-DD
  address?: string;
  idCardNumber?: string;
  idIssueDate?: string;
  idIssuePlace?: string;
  note?: string;
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

export default function AdminUserEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isEdit = useMemo(() => id !== "create", [id]);
  const [loading, setLoading] = useState<boolean>(!!isEdit);
  const [userData, setUserData] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "customer",
      gender: "other", // default
    },
  });

  // Map technical field names to friendly labels for toast messages
  const fieldLabelMap: Record<string, string> = {
    name: "Họ tên",
    email: "Email",
    phone: "Số điện thoại",
    password: "Mật khẩu",
    role: "Quyền",
    idCardNumber: "Số CCCD",
  };

  useEffect(() => {
    if (!isEdit) return setLoading(false);
    (async () => {
      try {
        const u = await userService.getAdminUser(Number(id));
        setUserData(u);
        const uiRole = u.role as User['role'];
        reset({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          password: "",
          role: uiRole,
          gender: u.gender as any,
          dateOfBirth: u.dateOfBirth ? dayjs(u.dateOfBirth).format("YYYY-MM-DD") : "",
          address: u.address ?? "",
          idCardNumber: u.idCardNumber ?? "",
          idIssueDate: u.idIssueDate ? dayjs(u.idIssueDate).format("YYYY-MM-DD") : "",
          idIssuePlace: u.idIssuePlace ?? "",
          note: u.note ?? "",
        });
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Không tải được người dùng");
        router.replace("/admin/users");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  // Validate then submit (show toast errors like apartment page)
  async function handleSave() {
    try {
      const valid = await trigger();
      if (valid) {
        await handleSubmit(onSubmit)();
        return;
      }
      const msgs: string[] = [];
      const collect = (obj: any) => {
        if (!obj) return;
        for (const k of Object.keys(obj)) {
          const v = obj[k];
          if (!v) continue;
          if (typeof v.message === "string" && v.message) {
            msgs.push(v.message);
          } else if (v.type === "required") {
            msgs.push(fieldLabelMap[k] ?? `Trường ${k} bắt buộc`);
          } else if (typeof v === "object") {
            collect(v);
          }
        }
      };
      collect(errors as any);
      const unique = Array.from(new Set(msgs));
      if (!unique.length) unique.push("Vui lòng kiểm tra lại thông tin nhập");
      unique.forEach((m) => toast.error(m));
    } catch {
      toast.error("Có lỗi khi kiểm tra dữ liệu. Vui lòng thử lại.");
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      const backendRole = (values.role === "host" ? "host" : values.role) as "customer" | "host" | "admin" | undefined;
      const payload = {
        name: values.name?.trim() || undefined,
        email: values.email.trim(),
        phone: values.phone?.trim() || undefined,
        password: values.password?.trim() || undefined,
        role: backendRole,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : null,
        address: values.address,
        idCardNumber: values.idCardNumber,
        idIssueDate: values.idIssueDate ? new Date(values.idIssueDate) : null,
        idIssuePlace: values.idIssuePlace,
        note: values.note,
      };
      if (!payload.email) {
        toast.error("Vui lòng nhập email");
        return;
      }
      if (isEdit) {
        await userService.updateAdminUser(Number(id), payload);
        toast.success("Cập nhật người dùng thành công");
      } else {
        await userService.createAdminUser(payload);
        toast.success("Tạo người dùng thành công");
      }
      router.push("/admin/users");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || (isEdit ? "Cập nhật thất bại" : "Tạo người dùng thất bại"));
    }
  }

  if (loading) {
    return (
      <div className="min-h-[300px] grid place-items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-700 transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{isEdit ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}</p>
              <h1 className="text-lg font-semibold text-slate-800 dark:text-white line-clamp-1">Quản lý người dùng</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {Object.keys(dirtyFields || {}).length > 0 && (
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500">
                <Info className="w-4 h-4" /> Thay đổi chưa lưu
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="w-4 h-4 border-white" /> <span>Đang lưu…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isEdit ? "Cập nhật" : "Tạo mới"}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Thông tin cá nhân" icon={UserIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={textMuted}>Họ tên (tuỳ chọn)</label>
                <input className={inputCls} placeholder="Nguyễn Văn A" {...register("name")} />
              </div>
              <div className="md:col-span-2">
                <label className={textMuted}>Email</label>
                <input
                  className={inputCls}
                  placeholder="email@example.com"
                  {...register("email", { required: "Vui lòng nhập email" })}
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{String(errors.email.message)}</p>}
              </div>
              <div>
                <label className={textMuted}>Số điện thoại (tuỳ chọn)</label>
                <input className={inputCls} placeholder="0901234567" {...register("phone")} />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            {userData && (userData.idCardFront || userData.idCardBack) && (
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 aspect-video flex items-center justify-center relative overflow-hidden">
                  {userData.idCardFront ? (
                    <img src={userData.idCardFront} alt="Mặt trước" className="w-full h-full object-contain" />
                  ) : <span className="text-xs text-slate-400">Chưa có ảnh mặt trước</span>}
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 aspect-video flex items-center justify-center relative overflow-hidden">
                  {userData.idCardBack ? (
                    <img src={userData.idCardBack} alt="Mặt sau" className="w-full h-full object-contain" />
                  ) : <span className="text-xs text-slate-400">Chưa có ảnh mặt sau</span>}
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <Section title="Quyền & Bảo mật" icon={Shield}>
            <div className="space-y-4">
              <div>
                <label className={textMuted}>Quyền truy cập</label>
                <select className={inputCls} {...register("role", { required: true })}>
                  <option value="customer">Customer (Cư dân)</option>
                  <option value="host">Host (Chủ nhà)</option>
                  <option value="admin">Admin (Quản trị)</option>
                </select>
                {errors.role && <p className="text-red-600 text-sm mt-1">Vui lòng chọn quyền</p>}
                <p className="text-xs text-slate-500 mt-1">
                  {/* Description based on selection could go here */}
                  Admin: Quyền cao nhất. Host: Quản lý nhà. Customer: Tìm phòng/Thuê.
                </p>
              </div>

              <div>
                <label className={textMuted}>{isEdit ? "Đổi mật khẩu" : "Mật khẩu"}</label>
                <input type="password" className={inputCls} placeholder="••••••••" {...register("password")} />
                {isEdit && <p className="text-xs text-slate-400 mt-1">Để trống nếu không muốn đổi.</p>}
              </div>
            </div>
          </Section>

          <Section title="Địa chỉ & Ghi chú" icon={MapPin}>
            <div className="space-y-4">
              <div>
                <label className={textMuted}>Địa chỉ thường trú</label>
                <textarea className={`${inputCls} h-24 py-2`} {...register("address")} placeholder="Địa chỉ hiện tại..." />
              </div>
              <div>
                <label className={textMuted}>Ghi chú nội bộ</label>
                <textarea className={`${inputCls} h-32 py-2`} {...register("note")} placeholder="Ghi chú về người dùng này..." />
              </div>
            </div>
          </Section>

          {isEdit && userData && (
            <div className="p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 text-xs text-slate-500">
              <div className="flex justify-between mb-2">
                <span>ID:</span> <span className="font-mono">#{userData.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span> <span>{dayjs(userData.createdAt).format("DD/MM/YYYY HH:mm")}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="hidden" />
    </div>
  );
}
