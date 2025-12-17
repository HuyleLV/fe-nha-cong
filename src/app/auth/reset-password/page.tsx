"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { userService } from "@/services/userService";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Read token from window search params on the client to avoid using
    // next/navigation hooks during prerender. This prevents build-time
    // prerender errors related to useSearchParams.
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token') || '';
    setToken(t);
  }, []);

  const handleSubmit = async (e: any) => {
    e?.preventDefault();
    if (!token) {
      toast.error("Thiếu token đặt lại mật khẩu");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.warning("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.warning("Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await userService.postResetPassword({ token, newPassword, confirmNewPassword });
      toast.success(res?.message || "Đặt lại mật khẩu thành công");
      router.replace("/dang-nhap");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow">
        <h2 className="text-xl font-semibold">Đặt lại mật khẩu</h2>
        {!token ? (
          <div className="mt-4 text-sm text-gray-700">Liên kết đặt lại không hợp lệ hoặc thiếu token.</div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mật khẩu mới" className="mt-1 w-full rounded-xl border px-3 py-2 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
              <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Xác nhận mật khẩu" className="mt-1 w-full rounded-xl border px-3 py-2 outline-none" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => router.push("/dang-nhap")} className="rounded-xl px-4 py-2 border">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-600 px-4 py-2 text-white disabled:opacity-60">{isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
