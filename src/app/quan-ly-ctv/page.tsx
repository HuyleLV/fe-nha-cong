"use client";

import React, { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";

export default function CtvIndexPage() {
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res: any = await axiosClient.get('/api/ctv/me/summary').catch(() => null);
        setSummary(res?.data ?? res ?? {});
      } catch (e) {
        console.debug('CTV summary not available', e);
        setSummary({});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Bảng điều khiển CTV</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow"> <div className="text-sm text-slate-500">Doanh thu (RV)</div> <div className="text-xl font-semibold">{summary.revenue ?? '-'}</div> </div>
        <div className="p-4 bg-white rounded shadow"> <div className="text-sm text-slate-500">Hoa hồng</div> <div className="text-xl font-semibold">{summary.commissions ?? '-'}</div> </div>
        <div className="p-4 bg-white rounded shadow"> <div className="text-sm text-slate-500">Khách có hợp đồng</div> <div className="text-xl font-semibold">{summary.customersActive ?? 0}</div> </div>
        <div className="p-4 bg-white rounded shadow"> <div className="text-sm text-slate-500">Khách không hợp đồng</div> <div className="text-xl font-semibold">{summary.customersInactive ?? 0}</div> </div>
      </div>
    </div>
  );
}
