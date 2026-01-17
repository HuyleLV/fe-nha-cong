"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Building2,
  ArrowRight,
  Wallet,
  Home,
  CalendarDays,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import StatCard from "./components/StatCard";
import { apartmentService } from "@/services/apartmentService";
import { buildingService } from "@/services/buildingService";
import { contractService } from "@/services/contractService";
import { depositService } from "@/services/depositService";
import { assetService } from '@/services/assetService';
import { landlordDashboardService } from "@/services/landlordDashboardService";

export default function HostDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    buildings: 0,
    apartments: 0,
    rented: 0,
    deposit: 0,
    vacant: 0,
    upcoming: 0,
    approved: 0,
    pending: 0,
  });

  const [assetCounts, setAssetCounts] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0, retired: 0, warrantyIn: 0, warrantyExpired: 0 });

  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.allSettled([
      buildingService.getAll({ limit: 1 }),
      apartmentService.getAll({ limit: 1 }),
      contractService.list({ limit: 1 }),
      depositService.list({ limit: 1 }).catch(() => ({ data: [], meta: { total: 0 } })),
      apartmentService.getAvailable({ limit: 1 }),
      apartmentService.getUpcomingVacant({ limit: 1 }),
      apartmentService.getAll({ isApproved: true, limit: 1 }),
      apartmentService.getAll({ isApproved: false, limit: 1 }),
    ])
      .then((results) => {
        if (!mounted) return;
        try {
          const [bRes, aRes, cRes, dRes, vRes, uRes, apvRes, apnRes] = results as any;

          const buildings = bRes.status === "fulfilled" ? (bRes.value.meta?.total ?? 0) : 0;
          const apartments = aRes.status === "fulfilled" ? (aRes.value.meta?.total ?? 0) : 0;
          const rented = cRes.status === "fulfilled" ? (cRes.value.meta?.total ?? 0) : 0;
          const deposit = dRes.status === "fulfilled" ? (dRes.value.meta?.total ?? dRes.value?.meta?.total ?? 0) : 0;
          const vacant = vRes.status === "fulfilled" ? (vRes.value.meta?.total ?? 0) : 0;
          const upcoming = uRes.status === "fulfilled" ? (uRes.value.meta?.total ?? 0) : 0;
          const approved = apvRes.status === "fulfilled" ? (apvRes.value.meta?.total ?? 0) : 0;
          const pending = apnRes.status === "fulfilled" ? (apnRes.value.meta?.total ?? 0) : 0;

          setCounts({ buildings, apartments, rented, deposit, vacant, upcoming, approved, pending });
        } catch (e) {
          // ignore and keep defaults
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const fmt = (n: number, label = "căn hộ") => `${n} ${label}`;

  // assets overview: counts by status and warranty
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await assetService.getAll({ limit: 1000 });
        const items = res.items || [];
        const now = new Date();
        let available = 0, inUse = 0, maintenance = 0, retired = 0, warrantyIn = 0, warrantyExpired = 0;
        for (const it of items) {
          const s = it.status;
          if (s === 'available') available++;
          else if (s === 'in_use') inUse++;
          else if (s === 'maintenance') maintenance++;
          else if (s === 'retired') retired++;

          const mwd = (it as any).manufacturerWarrantyDate ? new Date((it as any).manufacturerWarrantyDate) : null;
          if (mwd) {
            if (mwd >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) warrantyIn++;
            else warrantyExpired++;
          }
        }
        if (mounted) setAssetCounts({ total: items.length, available, inUse, maintenance, retired, warrantyIn, warrantyExpired });
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load dashboard stats from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stats = await landlordDashboardService.getStats();
        if (mounted) setDashboardStats(stats);
      } catch (e) {
        console.error('Failed to load dashboard stats:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-6 lg:py-8 space-y-8 lg:space-y-10">

        {/* KHỐI: TÌNH TRẠNG PHÒNG & GIƯỜNG */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">Tình trạng phòng</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Tổng quan tòa nhà, căn hộ & giường</h2>
              <p className="text-xs text-slate-500">Nắm nhanh mức độ lấp đầy và tình trạng hoạt động của tài sản.</p>
            </div>
            <Link href="/quan-ly-chu-nha/toa-nha" className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline">
              Quản lý tòa nhà
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Thống kê chính: hiển thị 8 khối theo yêu cầu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Tổng tòa nhà" value={loading ? "—" : `${counts.buildings} tòa nhà`} color="emerald" icon={<Building2 className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/toa-nha" />
            <StatCard title="Tổng căn hộ" value={loading ? "—" : fmt(counts.apartments)} sub="(tổng số căn thuộc quản lý)" color="slate" icon={<Home className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/can-ho" />
            <StatCard title="Căn hộ đang thuê (có hợp đồng)" value={loading ? "—" : fmt(counts.rented)} sub="(có hợp đồng thuê)" color="sky" icon={<Home className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/can-ho?status=rent" />
            <StatCard title="Căn hộ đang cọc" value={loading ? "—" : fmt(counts.deposit)} sub="(có giấy cọc, chưa có hợp đồng)" color="amber" icon={<Wallet className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/can-ho?status=deposit" />
            <StatCard title="Căn hộ đang trống" value={loading ? "—" : fmt(counts.vacant)} sub="(chưa có người thuê)" color="lime" icon={<Home className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/can-ho?status=vacant" />
            <StatCard title="Căn hộ sắp trống" value={loading ? "—" : fmt(counts.upcoming)} sub="(sẽ trống sắp tới)" color="cyan" icon={<CalendarDays className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/can-ho?status=upcoming" />
            <StatCard title="Căn hộ đã duyệt" value={loading ? "—" : fmt(counts.approved)} sub="(đã phê duyệt/hiển thị)" color="violet" icon={<CheckCircle className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/can-ho?status=approved" />
            <StatCard title="Căn hộ chưa được duyệt" value={loading ? "—" : fmt(counts.pending)} sub="(chờ duyệt)" color="rose" icon={<Clock className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/can-ho?status=pending" />
          </div>
        </section>

        {/* KHỐI: TỔNG QUAN TÀI SẢN */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">Tài sản</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Tổng quan tài sản</h2>
              <p className="text-xs text-slate-500">Xem nhanh số lượng tài sản theo trạng thái và bảo hành.</p>
            </div>
            <Link href="/quan-ly-chu-nha/danh-muc/tai-san" className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline">
              Quản lý tài sản
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <StatCard title="Tổng tài sản" value={loading ? '—' : assetCounts.total} color="slate" icon={<Building2 className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/tai-san" />
            <StatCard title="Sẵn sàng" value={loading ? '—' : assetCounts.available} color="emerald" icon={<CheckCircle className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/tai-san?status=available" />
            <StatCard title="Đang sử dụng" value={loading ? '—' : assetCounts.inUse} color="sky" icon={<Home className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/tai-san?status=in_use" />
            <StatCard title="Sửa chữa" value={loading ? '—' : assetCounts.maintenance} color="amber" icon={<Wallet className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/tai-san?status=maintenance" />
            <StatCard title="Hỏng" value={loading ? '—' : assetCounts.retired} color="rose" icon={<Clock className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/tai-san?status=retired" />
            <StatCard title="Còn bảo hành / Hết" value={loading ? '—' : `${assetCounts.warrantyIn} / ${assetCounts.warrantyExpired}`} color="violet" icon={<CalendarDays className="w-4 h-4" />} href="/quan-ly-chu-nha/danh-muc/tai-san" />
          </div>
        </section>

        {/* KHỐI: THỐNG KÊ TÀI CHÍNH */}
        {dashboardStats && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">Tài chính</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">Tổng quan tài chính</h2>
                <p className="text-xs text-slate-500">Doanh thu, chi phí và lợi nhuận tháng này.</p>
              </div>
              <Link href="/quan-ly-chu-nha/quan-ly-thue" className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline">
                Quản lý thuê
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Doanh thu tháng này"
                value={dashboardStats.revenue?.thisMonth ? `${Number(dashboardStats.revenue.thisMonth).toLocaleString('vi-VN')} đ` : "—"}
                color="emerald"
                icon={<TrendingUp className="w-4 h-4" />}
                href="/quan-ly-chu-nha/quan-ly-thue"
              />
              <StatCard
                title="Chi phí tháng này"
                value={dashboardStats.expenses?.thisMonth ? `${Number(dashboardStats.expenses.thisMonth).toLocaleString('vi-VN')} đ` : "—"}
                color="rose"
                icon={<TrendingDown className="w-4 h-4" />}
                href="/quan-ly-chu-nha/tai-chinh/thu-chi"
              />
              <StatCard
                title="Lợi nhuận tháng này"
                value={dashboardStats.profit?.thisMonth ? `${Number(dashboardStats.profit.thisMonth).toLocaleString('vi-VN')} đ` : "—"}
                color={Number(dashboardStats.profit?.thisMonth || 0) >= 0 ? "emerald" : "rose"}
                icon={<DollarSign className="w-4 h-4" />}
                href="/quan-ly-chu-nha/quan-ly-thue"
              />
              <StatCard
                title="Thanh toán chờ xử lý"
                value={dashboardStats.pendingPayments ? `${Number(dashboardStats.pendingPayments).toLocaleString('vi-VN')} đ` : "—"}
                color="amber"
                icon={<Clock className="w-4 h-4" />}
                href="/quan-ly-chu-nha/quan-ly-thue/payments"
              />
            </div>
          </section>
        )}

        {/* KHỐI: THỐNG KÊ HỢP ĐỒNG */}
        {dashboardStats && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">Hợp đồng</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">Tổng quan hợp đồng</h2>
                <p className="text-xs text-slate-500">Theo dõi hợp đồng đang hoạt động và sắp hết hạn.</p>
              </div>
              <Link href="/quan-ly-chu-nha/khach-hang/hop-dong" className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline">
                Quản lý hợp đồng
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <StatCard
                title="Hợp đồng đang hoạt động"
                value={dashboardStats.activeContracts || 0}
                color="emerald"
                icon={<CheckCircle className="w-4 h-4" />}
                href="/quan-ly-chu-nha/khach-hang/hop-dong?status=active"
              />
              <StatCard
                title="Hợp đồng sắp hết hạn (30 ngày)"
                value={dashboardStats.expiringContracts || 0}
                color="amber"
                icon={<AlertCircle className="w-4 h-4" />}
                href="/quan-ly-chu-nha/khach-hang/hop-dong"
              />
            </div>
          </section>
        )}

        {/* KHỐI: THỐNG KÊ KHÁCH HÀNG */}
        {dashboardStats?.customers && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">Khách hàng</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">Tổng quan khách hàng</h2>
                <p className="text-xs text-slate-500">Theo dõi khách hàng mới, tiềm năng và tỷ lệ chuyển đổi.</p>
              </div>
              <Link href="/quan-ly-chu-nha/khach-hang/khach-tiem-nang" className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline">
                Quản lý khách hàng
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Tổng khách hàng"
                value={dashboardStats.customers.total || 0}
                color="slate"
                icon={<Users className="w-4 h-4" />}
                href="/quan-ly-chu-nha/cu-dan/danh-sach"
              />
              <StatCard
                title="Khách hàng mới (tháng này)"
                value={dashboardStats.customers.newThisMonth || 0}
                color="sky"
                icon={<Users className="w-4 h-4" />}
                href="/quan-ly-chu-nha/cu-dan/danh-sach"
              />
              <StatCard
                title="Khách tiềm năng"
                value={dashboardStats.customers.potential || 0}
                color="amber"
                icon={<Users className="w-4 h-4" />}
                href="/quan-ly-chu-nha/khach-hang/khach-tiem-nang"
              />
              <StatCard
                title="Đã ký hợp đồng"
                value={dashboardStats.customers.contracted || 0}
                color="emerald"
                icon={<CheckCircle className="w-4 h-4" />}
                href="/quan-ly-chu-nha/khach-hang/hop-dong"
              />
              <StatCard
                title="Tỷ lệ chuyển đổi"
                value={dashboardStats.customers.conversionRate ? `${dashboardStats.customers.conversionRate}%` : "0%"}
                color="violet"
                icon={<TrendingUp className="w-4 h-4" />}
                href="/quan-ly-chu-nha/khach-hang"
              />
            </div>
          </section>
        )}

        {/* KHỐI: THỐNG KÊ CÔNG VIỆC */}
        {dashboardStats?.tasks && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">Công việc</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">Tổng quan công việc</h2>
                <p className="text-xs text-slate-500">Theo dõi công việc chưa hoàn thành, quá hạn và đã nghiệm thu.</p>
              </div>
              <Link href="/quan-ly-chu-nha/cong-viec" className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline">
                Quản lý công việc
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Tổng công việc"
                value={dashboardStats.tasks.total || 0}
                color="slate"
                icon={<Briefcase className="w-4 h-4" />}
                href="/quan-ly-chu-nha/cong-viec"
              />
              <StatCard
                title="Chưa hoàn thành"
                value={dashboardStats.tasks.incomplete || 0}
                color="amber"
                icon={<Clock className="w-4 h-4" />}
                href="/quan-ly-chu-nha/cong-viec"
              />
              <StatCard
                title="Quá hạn"
                value={dashboardStats.tasks.overdue || 0}
                color="rose"
                icon={<AlertCircle className="w-4 h-4" />}
                href="/quan-ly-chu-nha/cong-viec"
              />
              <StatCard
                title="Đã nghiệm thu"
                value={dashboardStats.tasks.completed || 0}
                color="emerald"
                icon={<CheckCircle className="w-4 h-4" />}
                href="/quan-ly-chu-nha/cong-viec"
              />
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
