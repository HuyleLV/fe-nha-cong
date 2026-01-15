"use client";

import React, { useEffect, useState } from 'react';
import { bankAccountService } from '@/services/bankAccountService';
import { formatMoneyVND } from '@/utils/format-number';
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';
import { apiUrl } from '@/utils/apiUrl';
import axiosClient from '@/utils/axiosClient';

type Row = {
  date: string;
  accountLabel: string;
  startingBalance: number;
  totalThu: number;
  totalChi: number;
  endingBalance: number;
};

export default function SoQuyTheoNgayPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res: any = await bankAccountService.hostDailyCashbook({ page, limit });
      const its = res?.items ?? res;
      const meta = res?.meta ?? { page, limit, total: Array.isArray(its) ? its.length : 0 };
      setItems((its ?? []).map((r: any) => ({
        date: r.date ?? r.day ?? r.time ?? r.createdAt ?? r.thoi_gian ?? '',
        accountLabel: r.accountLabel ?? r.account ?? r.accountName ?? '',
        startingBalance: Number(r.startingBalance ?? r.start ?? r.sodu_dau ?? 0) || 0,
        totalThu: Number(r.totalThu ?? r.thu ?? 0) || 0,
        totalChi: Number(r.totalChi ?? r.chi ?? 0) || 0,
        endingBalance: Number(r.endingBalance ?? r.end ?? r.ending ?? 0) || 0,
      })));
      setTotal(Number(meta.total ?? 0));
    } catch (e) {
      // fallback: try direct axios call
      try {
        const payload: any = await axiosClient.get(apiUrl(`/api/bank-accounts/host/daily-cashbook`), { params: { page, limit } });
        const its = payload?.items ?? payload?.data ?? payload;
        setItems((its ?? []).map((r: any) => ({
          date: r.date ?? r.day ?? '',
          accountLabel: r.accountLabel ?? r.account ?? '',
          startingBalance: Number(r.startingBalance ?? r.start ?? 0) || 0,
          totalThu: Number(r.totalThu ?? r.thu ?? 0) || 0,
          totalChi: Number(r.totalChi ?? r.chi ?? 0) || 0,
          endingBalance: Number(r.endingBalance ?? r.end ?? 0) || 0,
        })));
        setTotal(Number(payload?.meta?.total ?? (Array.isArray(its) ? its.length : 0)));
      } catch (err) {
        console.error('Failed loading daily cashbook', err);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Sổ quỹ theo ngày</h1>

      {/* Title only - no date filters as requested */}

      <AdminTable headers={[ 'Thời gian', 'Tài khoản', 'Số dư đầu', 'Tổng thu', 'Tổng chi', 'Tồn cuối' ]} loading={loading} emptyText="Không có dữ liệu">
        {items.map((r, idx) => (
          <tr key={idx} className="border-t">
            <td className="px-3 py-2 align-top text-left">{r.date}</td>
            <td className="px-3 py-2 align-top text-left">{r.accountLabel}</td>
            <td className="px-3 py-2 align-top text-right">{formatMoneyVND(r.startingBalance)}</td>
            <td className="px-3 py-2 align-top text-right">{formatMoneyVND(r.totalThu)}</td>
            <td className="px-3 py-2 align-top text-right">{formatMoneyVND(r.totalChi)}</td>
            <td className="px-3 py-2 align-top text-right">{formatMoneyVND(r.endingBalance)}</td>
          </tr>
        ))}
      </AdminTable>

      <Pagination page={page} limit={limit} total={total} onPageChange={(p) => { setPage(p); }} />
    </div>
  );
}
