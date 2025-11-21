"use client";

import React from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import Link from "next/link";

export default function CustomersIndexPage(){
  return (
    <div className="p-6">
      <Panel title="Khách hàng">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Quản lý các thông tin khách hàng và các quy trình liên quan.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/quan-ly-chu-nha/khach-hang/khach-hen" className="block p-4 rounded-lg border hover:shadow">Khách hẹn</Link>
            <Link href="/quan-ly-chu-nha/khach-hang/dat-coc" className="block p-4 rounded-lg border hover:shadow">Đặt cọc</Link>
            <Link href="/quan-ly-chu-nha/khach-hang/hop-dong" className="block p-4 rounded-lg border hover:shadow">Hợp đồng</Link>
            <Link href="/quan-ly-chu-nha/khach-hang/khach-hang" className="block p-4 rounded-lg border hover:shadow">Khách hàng</Link>
            <Link href="/quan-ly-chu-nha/khach-hang/phuong-tien" className="block p-4 rounded-lg border hover:shadow">Phương tiện</Link>
          </div>
        </div>
      </Panel>
    </div>
  );
}
