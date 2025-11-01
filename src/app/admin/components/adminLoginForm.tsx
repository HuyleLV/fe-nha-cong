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
  const router = useRouter();

  function cleanupToken() {
    localStorage.removeItem("tokenAdmin");
    localStorage.removeItem("adminInfo");
    delete axiosClient.defaults.headers.common["Authorization"];
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const payload = { 
      identifier: identifier.trim(), 
      password_hash: password 
    };

    try {
      const res = await userService.postLoginAdmin(payload);
      const token = res?.accessToken;
      const user = res?.user as User | undefined;

      if (!token || !user) {
        toast.error("Tài khoản không hợp lệ");
        router.replace("/admin/login");
        return;
      }

      // Check role from response payload
      if (user.role !== "admin") {
        cleanupToken();
        toast.error("Tài khoản không hợp lệ");
        router.replace("/admin/login");
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
    } catch (err) {
      cleanupToken();
      toast.error("Tài khoản không hợp lệ");
      router.replace("/admin/login");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium">Email hoặc số điện thoại</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-500"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Nhập email hoặc số điện thoại quản trị..."
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Mật khẩu</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 cursor-pointer"
      >
        Đăng nhập
      </button>
    </form>
  );
}
