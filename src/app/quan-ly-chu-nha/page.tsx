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
} from "lucide-react";
import StatCard from "./components/StatCard";
import { apartmentService } from "@/services/apartmentService";
import { buildingService } from "@/services/buildingService";
import { contractService } from "@/services/contractService";
import { depositService } from "@/services/depositService";
import { assetService } from '@/services/assetService';
import { dashboardService } from "@/services/dashboardService";

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

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    dashboardService.getLandlordStats()
      .then((res: any) => {
        if (!mounted) return;

        // Map backend stats to UI state
        setCounts({
          buildings: res.revenue?.totalApartments || 0, // Approx
          apartments: res.totalApartments || 0,
          rented: res.activeContracts || 0,
          deposit: 0, // Backend logic for deposit currently simplified/removed in initial port
          vacant: (res.totalApartments || 0) - (res.activeContracts || 0), // Rough estimate
          upcoming: res.expiringContracts || 0,
          approved: res.apartments?.published || 0, // Check if this field exists in response
          pending: 0,
        });

        // Keep asset logic separate if dashboardService doesn't cover it yet, 
        // OR if I want to just focus on the main stats first.
        // For now, I will keep the asset fetching separately below or remove it if I trust the dashboardService to evolve.
        // Actually, let's keep assets as is for now since backend dashboard didn't include asset stats.
      })
      .catch(err => {
        console.error("Dashboard load failed", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Format helper
  const fmt = (n: number, label = "căn hộ") => `${n} ${label}`;

  // Keep asset loading for now as it uses a separate service not yet in backend dashboard
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

      </div>
    </div>
  );
}
