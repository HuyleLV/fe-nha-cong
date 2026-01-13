"use client";

import React, { useEffect, useState } from 'react';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import AdminTable from '@/components/AdminTable';
import { depositService } from '@/services/depositService';
import { apartmentService } from '@/services/apartmentService';
import { formatMoneyVND } from '@/utils/format-number';
import Pagination from '@/components/Pagination';

export default function CanHoNhanCocPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(1);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload: any = await depositService.list({ page, limit });
        // payload is expected to have { data, meta } but be tolerant of shapes
        let deposits: any[] = [];
        if (Array.isArray(payload)) deposits = payload;
        else if (Array.isArray(payload?.data)) deposits = payload.data;
        else if (Array.isArray(payload?.items)) deposits = payload.items;
        else if (Array.isArray(payload?.data?.items)) deposits = payload.data.items;
        else deposits = payload?.data ?? payload?.items ?? [];

  const meta = payload?.meta ?? payload?.data?.meta ?? {};
  const totalCount = Number((meta?.total ?? meta?.totalItems ?? deposits.length) || 0);
        const limitFromMeta = Number(meta?.limit || limit);
        const pageCountCalc = Number(meta?.pageCount ?? Math.max(1, Math.ceil(totalCount / (limitFromMeta || limit))));

        if (!mounted) return;
        setTotal(totalCount);
        setPageCount(pageCountCalc);

        // collect apartment ids and batch fetch apartment details for current page
        const ids = Array.from(new Set(deposits.map((d: any) => d.apartment?.id || d.apartmentId).filter(Boolean)));
        const aptMap: Record<string | number, any> = {};
        if (ids.length > 0) {
          const promises = ids.map((id) =>
            apartmentService.getById(id).then((a) => ({ id, a })).catch(() => ({ id, a: null }))
          );
          const results = await Promise.all(promises);
          for (const r of results) {
            if (r && r.id) aptMap[r.id] = r.a;
          }
        }

        // attach resolved apartment info to deposit items when missing
        const enriched = deposits.map((d: any) => {
          const aid = d.apartment?.id || d.apartmentId;
          if (!d.apartment && aid && aptMap[aid]) d.apartment = aptMap[aid];
          return d;
        });

        setItems(enriched || []);
      } catch (err: any) {
        setError(err?.message || 'Lỗi khi tải dữ liệu');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [page, limit]);

  return (
    <div className="p-6">
      <Panel title="Căn hộ nhận cọc">
        {error && <div className="text-sm text-rose-600">{error}</div>}
        <AdminTable
          headers={["Khu vực", "Địa chỉ", "Tòa nhà", "Căn hộ", "Khách hàng", "Giá thuê", "Giá cọc"]}
          loading={loading}
        >
          {items.length === 0 && !loading ? (
            <tr><td colSpan={7} className="text-center py-6 text-slate-600">Không tìm thấy căn hộ nhận cọc</td></tr>
          ) : (
            items.map((d: any) => {
              const apt = d.apartment || d.apartmentInfo || d.apartment_data || {};
              const locationName = apt?.locationName || apt?.location?.name || d.locationName || '-';
              const address = apt?.streetAddress || apt?.addressPath || apt?.address || d.address || '-';
              const building = apt?.buildingName || apt?.building?.name || '-';
              const aptTitle = apt?.title || apt?.roomCode || (apt?.id ? `#${apt.id}` : (d.apartmentId ? `#${d.apartmentId}` : '-'));
              const customer = d.customer?.name || d.customerName || d.customer_fullname || d.user?.name || d.userName || '-';
              const rent = apt?.rentPrice || d.rentPrice || d.price || 0;
              const deposit = d.amount || d.depositAmount || d.deposit_value || d.deposit || 0;

              return (
                <tr key={d.id || `${apt?.id || d.apartmentId || Math.random()}`}>
                  <td className="align-middle py-3">{locationName}</td>
                  <td className="align-middle py-3">{address}</td>
                  <td className="align-middle py-3">{building}</td>
                  <td className="align-middle py-3">{aptTitle}</td>
                  <td className="align-middle py-3">{customer}</td>
                  <td className="align-middle py-3">{formatMoneyVND(Number(rent || 0))}</td>
                  <td className="align-middle py-3">{formatMoneyVND(Number(deposit || 0))}</td>
                </tr>
              );
            })
          )}
        </AdminTable>
        <div className="mt-4">
          <Pagination page={page} limit={limit} total={total} onPageChange={(p) => setPage(p)} />
        </div>
      </Panel>
    </div>
  );
}
