"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Save, CheckCircle2, Info, ChevronRight } from "lucide-react";

import { userService } from "@/services/userService";
import type { User } from "@/type/user";
import Spinner from "@/components/spinner";

type FormValues = {
  name?: string;
  email: string;
  phone?: string;
  password?: string;
  role: User["role"]; // UI role: customer | owner | admin
};

const inputCls =
  "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";
const textMuted = "text-sm text-slate-600";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
      <ChevronRight className="w-4 h-4 text-slate-400" />
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export default function AdminUserEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isEdit = useMemo(() => id !== "create", [id]);
  const [loading, setLoading] = useState<boolean>(!!isEdit);

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
    },
  });

  // Map technical field names to friendly labels for toast messages
  const fieldLabelMap: Record<string, string> = {
    name: "Họ tên",
    email: "Email",
    phone: "Số điện thoại",
    password: "Mật khẩu",
    role: "Quyền",
  };

  useEffect(() => {
    if (!isEdit) return setLoading(false);
    (async () => {
      try {
        const u = await userService.getAdminUser(Number(id));
        // Backend may store role 'host'; UI shows 'owner'
        const uiRole = (u.role === "owner" || (u as any).role === "host") ? ("owner" as User["role"]) : (u.role as User["role"]);
        reset({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          password: "",
          role: uiRole,
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
      const backendRole = (values.role === "owner" ? "host" : values.role) as "customer" | "host" | "admin" | undefined;
      const payload = {
        email: values.email.trim(),
        password: values.password?.trim() || undefined,
        role: backendRole,
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
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">{isEdit ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">Quản lý người dùng</h1>
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
                  <Spinner /> <span>Đang lưu…</span>
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
              className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Thông tin cơ bản">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <label className={textMuted}>{isEdit ? "Đổi mật khẩu (nếu nhập)" : "Mật khẩu (tuỳ chọn)"}</label>
                <input type="password" className={inputCls} placeholder="••••••••" {...register("password")} />
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Quyền & trạng thái">
            <div className="space-y-3">
              <div>
                <label className={textMuted}>Quyền</label>
                <select className={inputCls} {...register("role", { required: true })}>
                  <option value="customer">customer</option>
                  <option value="owner">host</option>
                  <option value="admin">admin</option>
                </select>
                {errors.role && <p className="text-red-600 text-sm mt-1">Vui lòng chọn quyền</p>}
              </div>
              <p className="text-xs text-slate-500">Lưu ý: Quyền "host" sẽ hiển thị là "owner" trong giao diện.</p>
            </div>
          </Section>
        </div>
      </div>

      <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="hidden" />
    </div>
  );
}
