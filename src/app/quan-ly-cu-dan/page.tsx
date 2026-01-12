"use client";

import React from "react";
import Link from "next/link";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";

export default function QuanLyCuDanIndex() {
    const items = [
        { href: "/quan-ly-cu-dan/phong-da-xem", label: "Lịch sử xem phòng" },
        { href: "/quan-ly-cu-dan/lich-su-thue", label: "Lịch sử thuê phòng" },
        { href: "/quan-ly-cu-dan/diem-cong", label: "Điểm cộng" },
        { href: "/quan-ly-cu-dan/dong-cong", label: "Đồng cộng" },
        { href: "/quan-ly-cu-dan/uu-dai", label: "Ưu đãi" },
        { href: "/quan-ly-cu-dan/khuyen-mai", label: "Khuyến mãi" },
        { href: "/quan-ly-cu-dan/dang-ky-ctv", label: "Đăng ký CTV" },
        { href: "/quan-ly-cu-dan/yeu-cau", label: "Trang yêu cầu" },
    ];

    return (
        <div className="p-6">
            <Panel title="Quản lý cư dân">
                <p className="text-sm text-slate-600">Khu vực quản lý cư dân (tách riêng khỏi trang quản lý chủ nhà).</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                {items.map((it) => (
                    <Link key={it.href} href={it.href} className="block rounded-lg border p-3 hover:bg-emerald-50">
                        {it.label}
                    </Link>
                ))}
                </div>
            </Panel>
        </div>
    );
}
