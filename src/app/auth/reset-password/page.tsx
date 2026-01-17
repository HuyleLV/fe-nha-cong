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
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-white">Đặt lại mật khẩu</h2>
        {!token ? (
          <div className="mt-4 text-sm text-center text-slate-500 dark:text-slate-400">Liên kết đặt lại không hợp lệ hoặc thiếu token.</div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/dang-nhap")}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 disabled:opacity-60 disabled:shadow-none"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
