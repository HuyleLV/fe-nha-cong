"use client";

import Link from "next/link";
import {
  Building2,
  ArrowRight,
  Wallet,
  Home,
  PlusCircle,
  CalendarDays,
  BedDouble,
} from "lucide-react";
import StatCard from "./components/StatCard";
import DashboardHero from "./components/Hero";


export default function HostDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-6 lg:py-8 space-y-8 lg:space-y-10">
        {/* HERO */}
        <DashboardHero
          areaLabel="Khu vực Chủ nhà"
          title="Bảng tin"
          subtitle="Tổng quan hoạt động, hợp đồng, tài chính và công việc trong hệ thống của bạn."
          leftIcon={<Building2 className="w-6 h-6" />}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/quan-ly-chu-nha/dang-tin"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-700 px-3.5 py-2 text-sm font-semibold shadow-sm hover:bg-emerald-50 hover:shadow-md transition"
              >
                <PlusCircle className="w-4 h-4" />
                Đăng tin mới
              </Link>
              <Link
                href="/quan-ly-chu-nha/bai-dang"
                className="inline-flex items-center gap-2 rounded-xl border border-white/70 text-white/95 px-3.5 py-2 text-sm font-medium hover:bg-white/10 transition"
              >
                <Home className="w-4 h-4" />
                Bài đăng của tôi
              </Link>
              <Link
                href="/quan-ly-chu-nha/lich-xem"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/70 text-white/95 px-3.5 py-2 text-sm font-medium hover:bg-white/10 transition"
              >
                <CalendarDays className="w-4 h-4" />
                Lịch xem phòng
              </Link>
            </div>
          }
        />

        {/* KHỐI: TÌNH TRẠNG PHÒNG & GIƯỜNG */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">
                Tình trạng phòng
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                Tổng quan tòa nhà, căn hộ & giường
              </h2>
              <p className="text-xs text-slate-500">
                Nắm nhanh mức độ lấp đầy và tình trạng hoạt động của tài sản.
              </p>
            </div>
            <Link
              href="/quan-ly-chu-nha/toa-nha"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
            >
              Quản lý tòa nhà
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Hàng 1: Tòa nhà & căn hộ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Tòa nhà"
              value="2 tòa nhà"
              color="emerald"
              icon={<Building2 className="w-4 h-4" />}
            />
            <StatCard
              title="Căn hộ đang thuê"
              value="0 căn hộ"
              sub="0% số căn hoạt động"
              color="sky"
              icon={<Home className="w-4 h-4" />}
            />
            <StatCard
              title="Căn hộ đang cọc"
              value="0 căn hộ"
              sub="0% số căn hoạt động"
              color="amber"
              icon={<Wallet className="w-4 h-4" />}
            />
            <StatCard
              title="Căn hộ đang trống"
              value="2 căn hộ"
              sub="100% số căn hoạt động"
              color="lime"
              icon={<Home className="w-4 h-4" />}
            />
          </div>

          {/* Hàng 2: Căn ngừng hoạt động & giường */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Căn hộ ngừng hoạt động"
              value="0 căn hộ"
              sub="0% số căn hoạt động"
              color="rose"
              icon={<Home className="w-4 h-4" />}
            />
            <StatCard
              title="Giường"
              value="0 giường"
              sub="0% tỷ lệ lấp đầy"
              color="violet"
              icon={<BedDouble className="w-4 h-4" />}
            />
            <StatCard
              title="Giường đang cọc"
              value="0 giường"
              sub="0% giường hoạt động"
              color="indigo"
              icon={<Wallet className="w-4 h-4" />}
            />
            <StatCard
              title="Giường đang trống"
              value="0 giường"
              sub="0% giường hoạt động"
              color="cyan"
              icon={<BedDouble className="w-4 h-4" />}
            />
          </div>
        </section>

      </div>
    </div>
  );
}
