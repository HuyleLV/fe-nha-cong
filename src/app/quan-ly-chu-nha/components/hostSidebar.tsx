"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
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
        { href: "/quan-ly-chu-nha/khach-hang/khach-tiem-nang", label: "Khách tiềm năng", icon: CalendarDays },
        { href: "/quan-ly-chu-nha/khach-hang/dat-coc", label: "Đặt cọc", icon: CalendarDays },
        { href: "/quan-ly-chu-nha/khach-hang/hop-dong", label: "Hợp đồng", icon: CalendarDays },
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
    { href: "/quan-ly-chu-nha/thong-bao", label: "Thông báo", icon: FileText },
    { href: "/quan-ly-chu-nha/cong-viec", label: "Công việc", icon: CalendarDays },
    {
      href: "/quan-ly-chu-nha/bao-cao-bat-dong-san",
      label: "Báo cáo bất động sản",
      icon: BarChart2,
      children: [
        { href: "/quan-ly-chu-nha/bao-cao-bat-dong-san/can-ho-trong", label: "Căn hộ trống", icon: Home },
        { href: "/quan-ly-chu-nha/bao-cao-bat-dong-san/can-ho-sap-trong", label: "Căn hộ sắp trống", icon: CalendarDays },
        { href: "/quan-ly-chu-nha/bao-cao-bat-dong-san/can-ho-gia-han", label: "Căn hộ gia hạn", icon: Users },
        { href: "/quan-ly-chu-nha/bao-cao-bat-dong-san/can-ho-nhan-coc", label: "Căn hộ nhận cọc", icon: Home },
        { href: "/quan-ly-chu-nha/bao-cao-bat-dong-san/ty-le-lap-day", label: "Tỷ lệ lấp đầy", icon: BarChart2 },
        { href: "/quan-ly-chu-nha/bao-cao-bat-dong-san/khuyen-mai", label: "Báo cáo khuyến mãi", icon: DollarSign },
        { href: "/quan-ly-chu-nha/bao-cao-bat-dong-san/cho-thue", label: "Báo cáo cho thuê", icon: FileText },
        { href: "/quan-ly-chu-nha/bao-cao-bat-dong-san/bo-tra", label: "Báo cáo bỏ trả", icon: FileText },
      ],
    },
    {
      href: "/quan-ly-chu-nha/bao-cao-tai-chinh",
      label: "Báo cáo tài chính",
      icon: BarChart2,
      children: [
        { href: "/quan-ly-chu-nha/bao-cao-tai-chinh/so-quy-theo-ngay", label: "Sổ quỹ theo ngày", icon: FileText },
        { href: "/quan-ly-chu-nha/bao-cao-tai-chinh/dong-tien", label: "Dòng tiền", icon: DollarSign },
        { href: "/quan-ly-chu-nha/bao-cao-tai-chinh/phan-bo-loi-nhuan", label: "Phân bổ lợi nhuận", icon: BarChart2 },
        { href: "/quan-ly-chu-nha/bao-cao-tai-chinh/khach-no-tien", label: "Khách nợ tiền", icon: FileText },
        { href: "/quan-ly-chu-nha/bao-cao-tai-chinh/lich-thanh-toan", label: "Lịch thanh toán", icon: CalendarDays },
        { href: "/quan-ly-chu-nha/bao-cao-tai-chinh/tien-thua", label: "Tiền thừa", icon: DollarSign },
        { href: "/quan-ly-chu-nha/bao-cao-tai-chinh/danh-sach-tien-coc", label: "Danh sách tiền cọc", icon: FileText },
      ],
    },
    { href: "/quan-ly-chu-nha/cai-dat-chung", label: "Cài đặt chung", icon: FileText },
    {
      href: "/quan-ly-chu-nha/danh-muc-khac",
      label: "Danh mục khác",
      icon: FileText,
      children: [
        { href: "/quan-ly-chu-nha/danh-muc-khac/danh-sach-tai-khoan", label: "Danh sách tài khoản", icon: DollarSign },
        { href: "/quan-ly-chu-nha/danh-muc-khac/tai-san", label: "Tài sản", icon: Home },
        { href: "/quan-ly-chu-nha/danh-muc-khac/quan-ly-hotline", label: "Quản lý hotline", icon: CalendarDays },
        { href: "/quan-ly-chu-nha/danh-muc-khac/zalo-oa", label: "Zalo OA", icon: Users },
        { href: "/quan-ly-chu-nha/danh-muc-khac/loai-cong-viec", label: "Loại công việc", icon: CalendarDays },
        { href: "/quan-ly-chu-nha/danh-muc-khac/danh-muc-chung", label: "Danh mục chung", icon: FileText },
        { href: "/quan-ly-chu-nha/danh-muc-khac/danh-sach-tang", label: "Danh sách tầng", icon: Home },
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
          try { localStorage.setItem(STORAGE_KEY, parent.href); } catch { }
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
    } catch { }
  }, [openMenu]);

  return (
    <aside className="w-64 bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300 flex flex-col min-h-screen border-r border-slate-200 dark:border-slate-800 shadow-sm pt-5">
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <h1 className="font-semibold text-slate-800 dark:text-slate-200">Chủ nhà</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Bảng điều khiển</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="h-9 w-9 rounded-full bg-emerald-600 text-white grid place-items-center text-sm font-medium">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{info?.name ?? "Chủ nhà"}</div>
            {info?.email && <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{info.email}</div>}
          </div>
          <div className="ml-auto">
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      <nav className="mt-3 px-3 space-y-1.5">
        {menu.map(({ href, label, icon: Icon, children }) => {
          const itemActive = href === "/quan-ly-chu-nha" ? pathname === href : pathname.startsWith(href);

          // Insert small section titles before specific groups for visual separation
          let sectionHeader: React.ReactNode = null;
          if (label === "Cài đặt chung") {
            sectionHeader = (
              <div key="__settings_header__" className="px-1 pt-2 pb-1">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide">Cài đặt</div>
              </div>
            );
          } else if (label === "Báo cáo bất động sản") {
            sectionHeader = (
              <div key="__reports_header__" className="px-1 pt-2 pb-1">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide">Báo cáo</div>
              </div>
            );
          } else if (label === "Danh mục dữ liệu") {
            sectionHeader = (
              <div key="__operations_header__" className="px-1 pt-2 pb-1">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide">Vận hành</div>
              </div>
            );
          }

          if (children?.length) {
            const anyChildActive = children.some((c) => pathname.startsWith(c.href));
            const active = itemActive || anyChildActive;

            return (
              <React.Fragment key={href}>
                {sectionHeader}
                <div>
                  <button
                    onClick={() => setOpenMenu(openMenu === href ? null : href)}
                    className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition text-sm ${active
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-900/50"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
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
                            className={`group relative flex items-center gap-3 pl-10 pr-3 py-2 rounded-md transition text-sm ${childActive
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-900/50"
                              : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
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
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={href}>
              {sectionHeader}
              <Link
                href={href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition text-sm ${itemActive
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-900/50"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
                  }`}
              >
                {itemActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-emerald-600" />}
                <Icon className="w-4.5 h-4.5" />
                <span className="truncate">{label}</span>
              </Link>
            </React.Fragment>
          );
        })}
      </nav>



      <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition cursor-pointer dark:border-slate-700 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-900"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
