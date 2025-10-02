"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import axiosClient from "@/utils/axiosClient";
import { toast } from "react-toastify";
import { Me } from "@/type/user";

export default function AdminLoginForm() {
  const [username, setUsername] = useState("");
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
      email: username.trim(), 
      password_hash: password 
    };

    try {
      const res = await userService.postLoginAdmin(payload);
      const token = res?.accessToken;

      if (!token) {
        toast.error("Tài khoản không hợp lệ");
        router.replace("/admin/login");
        return;
      }
  
      localStorage.setItem("tokenAdmin", token);
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  
      let me: Me;
      me = await userService.getMe(); 
  
      // 4) Không phải admin → out
      if (me.role !== "admin") {
        cleanupToken();
        toast.error("Tài khoản không hợp lệ");
        router.replace("/admin/login");
        return;
      }

      localStorage.setItem("adminInfo", JSON.stringify(me));
      toast.success("Đăng nhập thành công");
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
        <label className="block mb-1 text-sm font-medium">Username</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nhập tài khoản..."
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Password</label>
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
