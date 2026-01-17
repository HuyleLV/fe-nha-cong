"use client";

import AdminLoginForm from "@/app/admin/components/adminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quản trị viên</h1>
          <p className="text-slate-500 dark:text-slate-400">Đăng nhập để truy cập hệ thống quản lý</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
