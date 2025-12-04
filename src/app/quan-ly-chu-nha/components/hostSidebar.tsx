"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Home, PlusCircle, CalendarDays, LogOut, ChevronDown, Users, BarChart2, FileText, DollarSign } from "lucide-react";
import type { User } from "@/type/user";

export default function HostSidebar() {
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
    const name = (info?.name || "CN").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [info?.name]);

  const menu = [
    { href: "/quan-ly-chu-nha", label: "Bảng tin", icon: LayoutDashboard },
    { href: "/quan-ly-chu-nha/so-do-can-ho", label: "Sơ đồ căn hộ", icon: LayoutDashboard },
    {
      href: "/quan-ly-chu-nha/danh-muc",
      label: "Danh mục dữ liệu",
      icon: Home,
      children: [
        { href: "/quan-ly-chu-nha/danh-muc/khu-vuc", label: "Khu vực", icon: Home },
        { href: "/quan-ly-chu-nha/danh-muc/toa-nha", label: "Tòa nhà", icon: PlusCircle },
        { href: "/quan-ly-chu-nha/danh-muc/can-ho", label: "Căn hộ", icon: CalendarDays },
        { href: "/quan-ly-chu-nha/danh-muc/giuong", label: "Giường", icon: Home },
        { href: "/quan-ly-chu-nha/danh-muc/dich-vu", label: "Dịch vụ", icon: PlusCircle },
        { href: "/quan-ly-chu-nha/danh-muc/tai-san", label: "Tài sản", icon: CalendarDays },
      ],
    },
    {
      href: "/quan-ly-chu-nha/khach-hang",
      label: "Khách hàng",
      icon: Users,
      children: [
        { href: "/quan-ly-chu-nha/khach-hang/khach-hen", label: "Khách hẹn", icon: CalendarDays },
        { href: "/quan-ly-chu-nha/khach-hang/dat-coc", label: "Đặt cọc", icon: CalendarDays },
        { href: "/quan-ly-chu-nha/khach-hang/hop-dong", label: "Hợp đồng", icon: CalendarDays },
        { href: "/quan-ly-chu-nha/khach-hang/khach-hang", label: "Khách hàng", icon: Users },
        { href: "/quan-ly-chu-nha/khach-hang/phuong-tien", label: "Phương tiện", icon: CalendarDays },
      ],
    },
    {
      href: "/quan-ly-chu-nha/tai-chinh",
      label: "Tài chính",
      icon: BarChart2,
      children: [
        { href: "/quan-ly-chu-nha/tai-chinh/ghi-chi-so", label: "Ghi chỉ số", icon: BarChart2 },
        { href: "/quan-ly-chu-nha/tai-chinh/hoa-don", label: "Hóa đơn", icon: FileText },
        { href: "/quan-ly-chu-nha/tai-chinh/thu-chi", label: "Thu chi", icon: DollarSign },
      ],
    },
  ];

  const STORAGE_KEY = 'host_sidebar_open';
  const [openMenu, setOpenMenu] = useState<string | null>(() => {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

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

  // keep openMenu in sync with pathname: if a child route is active, open its parent
  useEffect(() => {
    try {
      const parent = menu.find((m) => m.children?.some((c) => pathname.startsWith(c.href)));
      if (parent) {
        if (openMenu !== parent.href) {
          setOpenMenu(parent.href);
          try { localStorage.setItem(STORAGE_KEY, parent.href); } catch {}
        }
        return;
      }
      // if no parent matches current pathname, keep stored openMenu (user preference)
    } catch (e) {
      // ignore
    }
  }, [pathname]);

  // persist openMenu changes
  useEffect(() => {
    try {
      if (openMenu) localStorage.setItem(STORAGE_KEY, openMenu);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [openMenu]);

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col min-h-screen border-r border-slate-200 shadow-sm">
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <h1 className="font-semibold text-slate-800">Chủ nhà</h1>
            <p className="text-xs text-slate-500">Bảng điều khiển</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
          <div className="h-9 w-9 rounded-full bg-emerald-600 text-white grid place-items-center text-sm font-medium">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-800 truncate">{info?.name ?? "Chủ nhà"}</div>
            {info?.email && <div className="text-xs text-slate-500 truncate">{info.email}</div>}
          </div>
        </div>
      </div>

      <nav className="mt-3 px-3 space-y-1.5">
        {menu.map(({ href, label, icon: Icon, children }) => {
          const itemActive = href === "/quan-ly-chu-nha" ? pathname === href : pathname.startsWith(href);

          if (children?.length) {
            const anyChildActive = children.some((c) => pathname.startsWith(c.href));
            const active = itemActive || anyChildActive;

            return (
              <div key={href}>
                <button
                  onClick={() => setOpenMenu(openMenu === href ? null : href)}
                  className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition text-sm ${
                    active
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-emerald-600" />}
                  <Icon className="w-4.5 h-4.5" />
                  <span className="truncate">{label}</span>
                  <ChevronDown className={`ml-auto w-4 h-4 transition-transform ${openMenu === href ? "rotate-180" : ""}`} />
                </button>

                {openMenu === href && (
                  <div className="mt-1 space-y-1">
                    {children.map(({ href: chHref, label: chLabel, icon: ChIcon }) => {
                      const childActive = pathname.startsWith(chHref);
                      return (
                        <Link
                          key={chHref}
                          href={chHref}
                          className={`group relative flex items-center gap-3 pl-10 pr-3 py-2 rounded-md transition text-sm ${
                            childActive
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                              : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                        >
                          {childActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-emerald-600" />}
                          <ChIcon className="w-4 h-4" />
                          <span className="truncate">{chLabel}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition text-sm ${
                itemActive
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {itemActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-emerald-600" />}
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
