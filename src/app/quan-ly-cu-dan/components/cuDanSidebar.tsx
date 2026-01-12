"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Users, FileText, CalendarDays, DollarSign, PlusCircle, Star, LogOut, ChevronDown } from "lucide-react";
import type { User } from "@/type/user";

export default function CuDanSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [info, setInfo] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
      setInfo(raw ? (JSON.parse(raw) as User) : null);
    } catch {
      setInfo(null);
    }
  }, []);

  const initials = useMemo(() => {
    const name = (info?.name || "CD").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [info?.name]);

  const menu = [
  { href: "/quan-ly-cu-dan", label: "Tổng quan", icon: LayoutDashboard },
    { href: "/quan-ly-cu-dan/phong-da-xem", label: "Lịch sử xem phòng", icon: FileText },
    { href: "/quan-ly-cu-dan/lich-su-thue", label: "Lịch sử thuê phòng", icon: CalendarDays },
    { href: "/quan-ly-cu-dan/diem-cong", label: "Điểm cộng", icon: Star },
    { href: "/quan-ly-cu-dan/dong-cong", label: "Đồng cộng", icon: DollarSign },
    { href: "/quan-ly-cu-dan/uu-dai", label: "Ưu đãi", icon: DollarSign },
    { href: "/quan-ly-cu-dan/khuyen-mai", label: "Khuyến mãi", icon: DollarSign },
  { href: "/quan-ly-cu-dan/dang-ky-ctv", label: "Đăng ký CTV", icon: PlusCircle },
    {
      href: "/quan-ly-cu-dan/yeu-cau",
      label: "Trang yêu cầu",
      icon: FileText,
      children: [
        { href: "/quan-ly-cu-dan/yeu-cau/bao-chay", label: "Báo cháy" },
        { href: "/quan-ly-cu-dan/yeu-cau/bao-sua-chua", label: "Báo sửa chữa" },
      ],
    },
  ];

  const onLogout = () => {
    try {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("tokenUser");
      sessionStorage.removeItem("auth_user");
      sessionStorage.removeItem("access_token");
      document.cookie = "access_token=; Max-Age=0; Path=/; SameSite=Lax";
    } finally {
      router.replace("/dang-nhap");
    }
  };

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col min-h-screen border-r border-slate-200 shadow-sm">
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <h1 className="font-semibold text-slate-800">Quản lý cư dân</h1>
            <p className="text-xs text-slate-500">Khu vực quản lý cư dân</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
          <div className="h-9 w-9 rounded-full bg-emerald-600 text-white grid place-items-center text-sm font-medium">{initials}</div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-800 truncate">{info?.name ?? "Cư dân"}</div>
            {info?.email && <div className="text-xs text-slate-500 truncate">{info.email}</div>}
          </div>
        </div>
      </div>

      <nav className="mt-3 px-3 space-y-1.5">
        {menu.map((m) => {
          const itemActive = m.href === "/quan-ly-cu-dan" ? pathname === m.href : pathname?.startsWith(m.href);
          if (m.children?.length) {
            const anyChildActive = m.children.some((c) => pathname?.startsWith(c.href));
            const active = itemActive || anyChildActive;
            return (
              <div key={m.href}>
                <Link
                  href={m.href}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition text-sm ${
                    active ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-emerald-600" />}
                  <m.icon className="w-4.5 h-4.5" />
                  <span className="truncate">{m.label}</span>
                </Link>

                {active && (
                  <div className="mt-1 space-y-1 pl-10">
                    {m.children.map((ch) => (
                      <Link key={ch.href} href={ch.href} className={`group relative flex items-center gap-3 py-2 rounded-md text-sm ${pathname?.startsWith(ch.href) ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"}`}>
                        <span className="truncate">{ch.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          const Icon = m.icon as any;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition text-sm ${
                itemActive ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {itemActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-emerald-600" />}
              <Icon className="w-4.5 h-4.5" />
              <span className="truncate">{m.label}</span>
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
