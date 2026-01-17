"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import axiosClient from "@/utils/axiosClient";
import { toast } from "react-toastify";
import { User } from "@/type/user";

export default function AdminLoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function cleanupToken() {
    localStorage.removeItem("tokenAdmin");
    localStorage.removeItem("adminInfo");
    delete axiosClient.defaults.headers.common["Authorization"];
  }

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!identifier.trim()) {
      newErrors.identifier = "Vui lòng nhập email hoặc số điện thoại";
    }
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});
    setLoading(true);

    const payload = {
      identifier: identifier.trim(),
      password_hash: password
    };

    try {
      const res = await userService.postLoginAdmin(payload);
      const token = res?.accessToken;
      const user = res?.user as User | undefined;

      if (!token || !user) {
        setErrors({ general: "Tài khoản hoặc mật khẩu không chính xác" });
        return;
      }

      // Check role from response payload
      if (user.role !== "admin") {
        cleanupToken();
        setErrors({ general: "Tài khoản không có quyền quản trị" });
        return;
      }

      // Persist token for admin endpoints and set axios header
      localStorage.setItem("tokenAdmin", token);
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Store admin info (flat user object) for UI/guards
      localStorage.setItem("adminInfo", JSON.stringify(user));

      // Show backend message if provided
      toast.success(res?.message || "Đăng nhập thành công");
      router.push("/admin/dashboard");
    } catch (err: any) {
      cleanupToken();
      const msg = err?.response?.data?.message || "Đăng nhập thất bại";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {errors.general && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30">
          {errors.general}
        </div>
      )}

      <div>
        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Email hoặc số điện thoại</label>
        <input
          type="text"
          className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all outline-none ${errors.identifier
              ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              : "border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            }`}
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            if (errors.identifier) setErrors(prev => ({ ...prev, identifier: undefined }));
          }}
          placeholder="Nhập tài khoản quản trị..."
        />
        {errors.identifier && <p className="mt-1 text-sm text-red-500">{errors.identifier}</p>}
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu</label>
        <input
          type="password"
          className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all outline-none ${errors.password
              ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              : "border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            }`}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
          }}
          placeholder="••••••••"
        />
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xử lý...
          </span>
        ) : "Đăng nhập"}
      </button>
    </form>
  );
}
