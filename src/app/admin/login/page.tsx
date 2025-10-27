"use client";

import AdminLoginForm from "@/app/admin/components/adminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập Quản trị</h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}
