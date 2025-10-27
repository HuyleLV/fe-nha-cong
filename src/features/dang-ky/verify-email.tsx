"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { userService } from "@/services/userService";

export default function VerifyEmailPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const email = useMemo(() => sp.get("email") ?? "", [sp]);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.info("Thiếu email cần xác thực. Vui lòng đăng ký lại.");
    }
  }, [email]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Không tìm thấy email để xác thực");
      return;
    }
    if (!code.trim()) {
      toast.warning("Vui lòng nhập mã OTP");
      return;
    }
    try {
      setLoading(true);
      const res = await userService.postVerifyEmail({ email, code: code.trim() });
      toast.success(res?.message || "Xác thực email thành công. Hãy đăng nhập.");
      router.push("/dang-nhap");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Xác thực thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Xác thực email</h1>
        <p className="text-sm text-gray-600">Chúng tôi đã gửi mã OTP tới email: <b>{email || "(không có)"}</b>. Vui lòng nhập mã để hoàn tất đăng ký.</p>
        <label className="block">
          <span className="block text-sm text-gray-700">Mã OTP</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\s+/g, ""))}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Nhập mã gồm 6 chữ số"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Đang xác thực..." : "Xác thực"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dang-ky")}
          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Quay lại đăng ký
        </button>
      </form>
    </div>
  );
}
