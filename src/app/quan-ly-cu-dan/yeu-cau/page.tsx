"use client";

import React from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import Link from "next/link";

export default function YeuCauIndexPage() {
  const items = [
    { href: "/quan-ly-cu-dan/yeu-cau/bao-chay", label: "Báo cháy" },
    { href: "/quan-ly-cu-dan/yeu-cau/bao-sua-chua", label: "Báo sửa chữa / Bảo hành" },
  ];

  return (
    <div className="p-6">
      <Panel title="Trang yêu cầu">
        <p className="text-sm text-slate-600">Các yêu cầu từ cư dân.</p>
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
