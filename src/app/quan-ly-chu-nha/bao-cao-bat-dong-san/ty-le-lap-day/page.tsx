"use client";

import React, { useEffect, useState } from 'react';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';
import { contractService } from '@/services/contractService';
import { depositService } from '@/services/depositService';
import { locationService } from '@/services/locationService';
import { formatMoneyVND } from '@/utils/format-number';

export default function TyLeLapDayCuPage(){
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // fetch buildings for page
        const bpayload = await buildingService.getAll({ page, limit });
        const buildings = bpayload.items ?? [];
        const meta = (bpayload as any).meta ?? {};
        if (!mounted) return;
        setTotal(meta?.total ?? 0);

        // Pre-fetch locations for buildings (so "Khu vực" shows correctly)
        const locationIds = Array.from(new Set(buildings.map((bb: any) => bb.locationId).filter(Boolean)));
        const locMap: Record<number, any> = {};
        if (locationIds.length > 0) {
          // fetch locations in parallel (use getById per id)
          const locPromises = locationIds.map((lid: number) =>
            locationService.getById(lid).then((l) => ({ id: lid, data: l })).catch(() => ({ id: lid, data: null }))
          );
          const locResults = await Promise.all(locPromises);
          for (const r of locResults) {
            if (r?.data) locMap[r.id] = r.data;
          }
        }

        // For each building, fetch counts
        const mapped = await Promise.all(buildings.map(async (b: any) => {
          try {
            // total apartments in building (use apartments endpoint meta.total)
            const aptRes = await apartmentService.getAll({ buildingId: b.id, limit: 1 });
            const totalApts = aptRes?.meta?.total ?? (aptRes?.items?.length ?? 0);

            // contracts in building → unique apartment ids
            const contracts = await contractService.list({ buildingId: b.id, limit: 1000 });
            const contractData = contracts?.data ?? [];
            const contractAptIds = new Set<number>(contractData.map((c: any) => c.apartmentId || c.apartment?.id).filter(Boolean));

            // deposits in building → unique apartment ids
            const deposits = await depositService.list({ buildingId: b.id, limit: 1000 });
            const depositItems = deposits?.data ?? [];
            const depositAptIds = new Set<number>(depositItems.map((d: any) => d.apartmentId || d.apartment?.id).filter(Boolean));

            // occupied = union of contractAptIds and depositAptIds
            const occupiedSet = new Set<number>([...Array.from(contractAptIds), ...Array.from(depositAptIds)]);
            const occupied = occupiedSet.size;
            const empty = Math.max(0, (Number(totalApts) || 0) - occupied);
            const fillPercent = (Number(totalApts) > 0) ? Math.round((occupied / Number(totalApts)) * 10000) / 100 : 0;

            return {
              id: b.id,
              region: locMap[b.locationId]?.name || b.locationName || b.location?.name || b.city || '-',
              buildingName: b.name || b.title || b.code || `Tòa nhà #${b.id}`,
              totalApts,
              occupied,
              empty,
              fillPercent,
            };
          } catch (e) {
            return {
              id: b.id,
              region: b.locationName || b.location?.name || '-',
              buildingName: b.name || b.title || `Tòa nhà #${b.id}`,
              totalApts: 0,
              occupied: 0,
              empty: 0,
              fillPercent: 0,
            };
          }
        }));

        if (!mounted) return;
        setRows(mapped);
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
      <Panel title="Tỷ lệ lấp đầy">
        {error && <div className="text-sm text-rose-600">{error}</div>}

        <AdminTable headers={["Khu vực", "Tòa nhà", "Số căn đã thuê", "Số căn trống", "% lấp đầy"]} loading={loading}>
          {rows.length === 0 && !loading ? (
            <tr><td colSpan={5} className="text-center py-6 text-slate-600">Không có dữ liệu</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <td className="align-middle py-3">{r.region}</td>
                <td className="align-middle py-3">{r.buildingName}</td>
                <td className="align-middle py-3">{r.occupied}</td>
                <td className="align-middle py-3">{r.empty}</td>
                <td className="align-middle py-3">{r.fillPercent}%</td>
              </tr>
            ))
          )}
        </AdminTable>

        <div className="mt-4">
          <Pagination page={page} limit={limit} total={total} onPageChange={(p) => setPage(p)} />
        </div>
      </Panel>
    </div>
  );
}
