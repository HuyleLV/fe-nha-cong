"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, LayoutDashboard, LocationEdit, LogOut, Newspaper, ParkingMeter, Users, ChevronDown, ChevronRight, MapPin, Landmark, Building2, CalendarDays } from "lucide-react";
import { Me } from "@/type/user";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [info, setInfo] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    setReady(true);
    try {
      const s = window.localStorage.getItem("adminInfo");
      setInfo(s ? (JSON.parse(s) as Me) : null);
    } catch {
      setInfo(null);
    }
  }, []);

  // Mặc định mở submenu khi đang đứng trong bất kỳ route con của location
  useEffect(() => {
    if (!ready) return;
    setLocationOpen(pathname.startsWith("/admin/location"));
  }, [pathname, ready]);

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
    { href: "/admin/users", label: "Quản lý Người dùng", icon: Users },
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
          const isLocation = href === "/admin/location";

          if (!isLocation) {
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
          }

          // Fancy group for Location with a prettier submenu
          const subLinks = [
            { href: "/admin/location/province", label: "Tỉnh", Icon: Landmark },
            { href: "/admin/location/city", label: "Thành phố", Icon: Building2 },
            { href: "/admin/location/district", label: "Quận", Icon: MapPin },
          ];
          const groupActive = pathname.startsWith("/admin/location");

          return (
            <div key={href} className="space-y-1">
              <button
                type="button"
                onClick={() => setLocationOpen((v) => !v)}
                className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-md transition text-sm ${
                  locationOpen || groupActive
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <span className="flex items-center gap-3">
                  {(locationOpen || groupActive) && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-emerald-600" />
                  )}
                  <Icon className="w-4.5 h-4.5" />
                  <span className="truncate">{label}</span>
                </span>
                {locationOpen ? (
                  <ChevronDown className="w-4 h-4 opacity-80" />
                ) : (
                  <ChevronRight className="w-4 h-4 opacity-80" />
                )}
              </button>

              {locationOpen && (
                <div className="ml-4 border-l border-emerald-100 pl-3">
                  <div className="rounded-md bg-emerald-50/60 p-1.5">
                    {subLinks.map(({ href: shref, label: slabel, Icon: SIcon }) => {
                      const subActive = pathname === shref || pathname.startsWith(`${shref}/`);
                      return (
                        <Link
                          key={shref}
                          href={shref}
                          className={`flex items-center gap-2 px-2 py-2 rounded transition text-sm ${
                            subActive
                              ? "text-emerald-700 bg-white shadow-sm ring-1 ring-emerald-100"
                              : "text-emerald-800/80 hover:bg-white hover:text-emerald-700"
                          }`}
                        >
                          <SIcon className="w-4 h-4" />
                          <span>{slabel}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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
