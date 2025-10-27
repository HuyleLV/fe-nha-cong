"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, LayoutDashboard, LocationEdit, LogOut, Newspaper, ParkingMeter } from "lucide-react";
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

  const initials = useMemo(() => {
    const name = (info?.name || "A").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [info?.name]);

  const menuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/blog", label: "Quản lý Bài Viết", icon: Newspaper },
    { href: "/admin/location", label: "Quản lý Địa Điểm", icon: LocationEdit },
    { href: "/admin/building", label: "Quản lý Tòa Nhà", icon: House },
    { href: "/admin/apartment", label: "Quản lý Căn Hộ", icon: House },
    { href: "/admin/partner", label: "Quản lý Đối Tác", icon: ParkingMeter },
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
    <aside className="w-64 bg-white text-slate-700 flex flex-col min-h-screen border-r border-slate-200 shadow-sm">
      {/* Brand */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <h1 className="font-semibold text-slate-800">Admin</h1>
            <p className="text-xs text-slate-500">Bảng điều khiển</p>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="px-4">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
          <div className="h-9 w-9 rounded-full bg-emerald-600 text-white grid place-items-center text-sm font-medium">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-800 truncate">{info?.name ?? "Admin"}</div>
            {info?.email && <div className="text-xs text-slate-500 truncate">{info.email}</div>}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-3 px-3 space-y-1.5">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition text-sm ${
                active
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-emerald-600" />
              )}
              <Icon className="w-4.5 h-4.5" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-slate-200">
        <button
          onClick={onLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
