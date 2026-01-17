"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, CalendarDays, DollarSign, LayoutDashboard, List, Eye } from "lucide-react";

export default function CtvSidebar() {
  const pathname = usePathname();

  const menu = [
    { href: '/quan-ly-ctv', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/quan-ly-ctv/commissions', label: 'Hoa hồng', icon: DollarSign },
    { href: '/quan-ly-ctv/customers', label: 'Khách hàng', icon: Users },
    { href: '/quan-ly-ctv/customers/contracts', label: 'Hợp đồng', icon: FileText },
    { href: '/quan-ly-ctv/viewings', label: 'Lịch xem phòng', icon: CalendarDays },
    { href: '/quan-ly-ctv/promos/rooms', label: 'Phòng ưu đãi', icon: List },
    { href: '/quan-ly-ctv/promos/deals', label: 'Bảng hàng khuyến mãi', icon: Eye },
  ];

  return (
    <aside className="w-64 bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300 flex flex-col min-h-screen border-r border-slate-200 dark:border-slate-800 shadow-sm pt-5">
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-800 dark:text-slate-200">Quản lý CTV</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Khu vực cộng tác viên</p>
          </div>
        </div>
      </div>

      <nav className="mt-3 px-3 space-y-1.5">
        {menu.map((m) => {
          const active = pathname === m.href || pathname?.startsWith(m.href + '/');
          const Icon = m.icon as any;
          return (
            <Link key={m.href} href={m.href} className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition text-sm ${active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400'}`}>
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-emerald-600" />}
              <Icon className="w-4.5 h-4.5" />
              <span className="truncate">{m.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
