"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, LayoutDashboard, LocationEdit, LogOut, Newspaper } from "lucide-react";
import { Me } from "@/type/user";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [info, setInfo] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    try {
      const s = window.localStorage.getItem("adminInfo");
      setInfo(s ? (JSON.parse(s) as Me) : null);
    } catch {
      setInfo(null);
    }
  }, []);

  const menuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/blog", label: "Quản lý Bài Viết", icon: Newspaper },
    { href: "/admin/location", label: "Quản lý Địa Điểm", icon: LocationEdit },
    { href: "/admin/apartment", label: "Quản lý Căn Hộ", icon: House },
  ];

  const onLogout = () => {
    try {
      localStorage.removeItem("tokenAdmin");
      localStorage.removeItem("adminInfo");
    } finally {
      router.replace("/admin/login");
    }
  };

  if (!ready) return null; // chờ client mount rồi mới render

  return (
    <aside className="w-64 bg-gray-900 text-gray-100 flex flex-col justify-between min-h-screen shadow-lg">
      <div>
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
        </div>

        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {info?.name ?? "Admin"}
          </h2>
          {info?.email && (
            <p className="text-xs text-gray-400 mt-1">{info.email}</p>
          )}
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map(({ href, label, icon: Icon }) => {
            // active nếu trùng hoặc là sub-path (vd /admin/blog/*)
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          <span>Thoát</span>
        </button>
      </div>
    </aside>
  );
}
