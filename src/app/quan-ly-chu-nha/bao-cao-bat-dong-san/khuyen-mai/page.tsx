"use client";

import React, { useEffect, useState } from 'react';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import { apartmentService } from '@/services/apartmentService';
import { contractService } from '@/services/contractService';
import { buildingService } from '@/services/buildingService';
import { locationService } from '@/services/locationService';
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';

type Row = {
  apartmentId: number;
  locationName: string;
  buildingName: string;
  apartmentTitle: string;
  roomCode?: string | null;
  tenantName: string;
  rentPrice: string;
  priceBefore: string;
  startDate?: string | null;
  expiryDate?: string | null;
};

function readStoredUser() {
  try {
    const rawLocal = localStorage.getItem('auth_user');
    const rawSession = sessionStorage.getItem('auth_user');
    const raw = rawLocal ?? rawSession;
    if (raw) return JSON.parse(raw);
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) return JSON.parse(adminInfo);
    return null;
  } catch (e) {
    return null;
  }
}

export default function KhuyenMaiPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    async function load(p: number = 1) {
      setLoading(true);
      setError(null);
      try {
        const user = readStoredUser();
        const userId = user?.id ?? user?.sub ?? null;
        if (!userId) {
          setError('Vui lòng đăng nhập để xem báo cáo cho chủ nhà.');
          setRows([]);
          setLoading(false);
          return;
        }

        // Fetch discounted apartments for current page
        const { items, meta } = await apartmentService.getDiscounted({ page: p, limit });
        setTotal(meta?.total ?? (meta?.totalCount ?? 0));

        // Keep only apartments owned by current host (defensive: check createdById or owner?.id)
        const hostApts = (items || []).filter((a: any) => {
          const created = (a as any).createdById ?? (a as any).created_by ?? (a as any).owner?.id ?? (a as any).owner?.userId;
          return created === userId;
        });

        if (!hostApts.length) {
          setRows([]);
          setLoading(false);
          return;
        }

        // Prepare maps for building/location names
        const buildingIds = Array.from(new Set(hostApts.map((a: any) => a.buildingId).filter(Boolean)));
        const locationIds = Array.from(new Set(hostApts.map((a: any) => a.locationId).filter(Boolean)));

        const buildingMap: Record<number, string> = {};
        await Promise.all(buildingIds.map(async (bid) => {
          try {
            const b = await buildingService.getById(bid as number);
            if (b) buildingMap[Number(bid)] = (b as any).name ?? String(bid);
          } catch (e) {
            // ignore
          }
        }));

        const locationMap: Record<number, string> = {};
        await Promise.all(locationIds.map(async (lid) => {
          try {
            const l = await locationService.getById(lid as number);
            if (l) locationMap[Number(lid)] = (l as any).name ?? String(lid);
          } catch (e) {
            // ignore
          }
        }));

        // For each apartment fetch contracts to find tenant
        // For the current page only: fetch contracts per apartment (page size is small so N requests is acceptable)
        const contractPromises = hostApts.map((a: any) =>
          contractService.list({ apartmentId: a.id, limit: 5 }).then(r => ({ apt: a, contracts: r.data })).catch(() => ({ apt: a, contracts: [] }))
        );

        const now = new Date();
        const settled = await Promise.all(contractPromises);

        const out: Row[] = [];
        for (const item of settled) {
          const a = item.apt;
          const contracts: any[] = item.contracts || [];
          // find active contract: prefer status === 'active' or date range covering today
          let matched: any = contracts.find(c => c?.status === 'active');
          if (!matched) {
            matched = contracts.find(c => {
              if (!c) return false;
              const s = c.startDate ? new Date(c.startDate) : null;
              const e = c.expiryDate ? new Date(c.expiryDate) : null;
              if (s && e) return s <= now && now <= e;
              return false;
            });
          }
          // Also allow any contract that has a customerName if no date/status info
          if (!matched && contracts.length) {
            matched = contracts[0];
          }

          if (!matched || !matched.customerName) continue; // skip apartments without tenant

          const rentPrice = String(a.rentPrice ?? '0');
          const discountAmt = Number(a.discountAmount ?? 0);
          const priceBefore = (Number(rentPrice) + (isNaN(discountAmt) ? 0 : discountAmt)).toFixed(0);

          out.push({
            apartmentId: a.id,
            locationName: a.location?.name ?? locationMap[a.locationId] ?? '-',
            buildingName: (a as any).buildingName ?? buildingMap[a.buildingId] ?? (a.buildingId ? String(a.buildingId) : '-'),
            apartmentTitle: a.title ?? (a.roomCode ? `${a.roomCode}` : `#${a.id}`),
            roomCode: a.roomCode ?? null,
            tenantName: matched.customerName ?? (matched.customer?.name ?? '-'),
            rentPrice: rentPrice,
            priceBefore: String(priceBefore),
            startDate: matched.startDate ?? null,
            expiryDate: matched.expiryDate ?? null,
          });
        }

        if (!cancelled) setRows(out);
      } catch (err: any) {
        console.error(err);
        if (!cancelled) setError(String(err?.message ?? err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load(page);
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6">
      <Panel title="Báo cáo khuyến mãi">
        {loading && <div className="text-slate-600">Đang tải dữ liệu...</div>}
        {!loading && error && <div className="text-red-600">{error}</div>}

        <AdminTable
          headers={[
            'Khu vực',
            'Tòa nhà',
            'Căn hộ',
            'Khách hàng',
            'Giá phòng',
            'Giá trước ưu đãi',
            'Ngày bắt đầu',
            'Ngày kết thúc',
          ]}
          loading={loading}
          emptyText={!error && !loading ? 'Không có phòng ưu đãi đang có khách thuộc quản lý của bạn.' : undefined}
        >
          {rows.map(r => (
            <tr key={r.apartmentId} className="border-t">
              <td className="px-3 py-2 align-top">{r.locationName}</td>
              <td className="px-3 py-2 align-top">{r.buildingName}</td>
              <td className="px-3 py-2 align-top">{r.apartmentTitle}{r.roomCode ? ` ({r.roomCode})` : ''}</td>
              <td className="px-3 py-2 align-top">{r.tenantName}</td>
              <td className="px-3 py-2 align-top">{r.rentPrice}</td>
              <td className="px-3 py-2 align-top">{r.priceBefore}</td>
              <td className="px-3 py-2 align-top">{r.startDate ? new Date(r.startDate).toLocaleDateString() : '-'}</td>
              <td className="px-3 py-2 align-top">{r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </AdminTable>

        <Pagination page={page} limit={limit} total={total} onPageChange={(p) => {
          setPage(p);
          // reload for new page
          (async () => {
            setLoading(true);
            setError(null);
            try {
              const user = readStoredUser();
              const userId = user?.id ?? user?.sub ?? null;
              if (!userId) {
                setError('Vui lòng đăng nhập để xem báo cáo cho chủ nhà.');
                setRows([]);
                setLoading(false);
                return;
              }
              const { items, meta } = await apartmentService.getDiscounted({ page: p, limit });
              setTotal(meta?.total ?? (meta?.totalCount ?? 0));
              const hostApts = (items || []).filter((a: any) => {
                const created = (a as any).createdById ?? (a as any).created_by ?? (a as any).owner?.id ?? (a as any).owner?.userId;
                return created === userId;
              });
              const settled = await Promise.all(hostApts.map((a: any) =>
                contractService.list({ apartmentId: a.id, limit: 5 }).then(r => ({ apt: a, contracts: r.data })).catch(() => ({ apt: a, contracts: [] }))
              ));
              const now = new Date();
              const out: Row[] = [];
              for (const item of settled) {
                const a = item.apt;
                const contracts: any[] = item.contracts || [];
                let matched: any = contracts.find(c => c?.status === 'active');
                if (!matched) {
                  matched = contracts.find(c => {
                    if (!c) return false;
                    const s = c.startDate ? new Date(c.startDate) : null;
                    const e = c.expiryDate ? new Date(c.expiryDate) : null;
                    if (s && e) return s <= now && now <= e;
                    return false;
                  });
                }
                if (!matched && contracts.length) matched = contracts[0];
                if (!matched || !matched.customerName) continue;
                const rentPrice = String(a.rentPrice ?? '0');
                const discountAmt = Number(a.discountAmount ?? 0);
                const priceBefore = (Number(rentPrice) + (isNaN(discountAmt) ? 0 : discountAmt)).toFixed(0);
                out.push({
                  apartmentId: a.id,
                  locationName: a.location?.name ?? '-',
                  buildingName: (a as any).buildingName ?? (a.buildingId ? String(a.buildingId) : '-'),
                  apartmentTitle: a.title ?? (a.roomCode ? `${a.roomCode}` : `#${a.id}`),
                  roomCode: a.roomCode ?? null,
                  tenantName: matched.customerName ?? (matched.customer?.name ?? '-'),
                  rentPrice: rentPrice,
                  priceBefore: String(priceBefore),
                  startDate: matched.startDate ?? null,
                  expiryDate: matched.expiryDate ?? null,
                });
              }
              setRows(out);
            } catch (err: any) {
              console.error(err);
              setError(String(err?.message ?? err));
            } finally {
              setLoading(false);
            }
          })();
        }} />
      </Panel>
    </div>
  );
}
