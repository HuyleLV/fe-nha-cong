"use client";

import React, { useEffect, useState } from 'react';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import AdminTable from '@/components/AdminTable';
import { apartmentService } from '@/services/apartmentService';
import { Apartment } from '@/type/apartment';
import { Asset } from '@/type/asset';
import { formatMoneyVND } from '@/utils/format-number';

export default function CanHoTrongPage(){
  const [items, setItems] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assetMap, setAssetMap] = useState<Record<number, Asset[]>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apartmentService.getAvailable({ limit: 100 });
        if (!mounted) return;
        const apartments = res.items || [];
        setItems(apartments);

        // Use assets returned by the backend (aggregated) when available
        const map: Record<number, Asset[]> = {};
        for (const ap of apartments) {
          const rawAssets = (ap as any).assets ?? [];
          let parsed: any[] = [];
          if (typeof rawAssets === 'string') {
            try { parsed = JSON.parse(rawAssets); } catch (e) { parsed = []; }
          } else if (Array.isArray(rawAssets)) parsed = rawAssets;
          map[ap.id] = parsed;
        }
        if (!mounted) return;
        setAssetMap(map);
      } catch (err: any) {
        setError(err?.message || 'Lỗi khi tải dữ liệu');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-6">
      <Panel title="Căn hộ trống">
        {error && <div className="text-sm text-rose-600">{error}</div>}
        <AdminTable
          headers={["Khu vực", "Địa chỉ", "Tòa nhà", "Căn hộ", "Tài sản", "Giá thuê"]}
          loading={loading}
        >
          {items.length === 0 && !loading ? (
            <tr><td colSpan={6} className="text-center py-6 text-slate-600">Không tìm thấy căn hộ trống</td></tr>
          ) : (
            items.map((a) => (
              <tr key={a.id}>
                <td className="align-middle py-3">{(a as any).locationName ?? a.location?.name ?? '-'}</td>
                <td className="align-middle py-3">{a.streetAddress ?? a.addressPath ?? '-'}</td>
                <td className="align-middle py-3">{(a as any).buildingName ?? '-'}</td>
                <td className="align-middle py-3">{a.title ?? a.roomCode ?? `#${a.id}`}</td>
                <td className="align-middle py-3">
                  {assetMap[a.id] && assetMap[a.id].length > 0 ? (
                    <ul className="list-none pl-0">
                      {assetMap[a.id].map((as) => (
                        <li key={as.id} className="text-sm text-slate-700">{`${as.id} - ${as.name}`}</li>
                      ))}
                    </ul>
                  ) : '-'}
                </td>
                <td className="align-middle py-3">{formatMoneyVND(Number(a.rentPrice || 0))}</td>
              </tr>
            ))
          )}
        </AdminTable>
      </Panel>
    </div>
  );
}
