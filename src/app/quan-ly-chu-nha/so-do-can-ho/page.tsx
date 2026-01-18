"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import { fNumber } from '@/utils/format-number';
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';
import { userService } from '@/services/userService';
import { Apartment } from '@/type/apartment';

type Room = {
  id: number;
  name: string;
  status: "vacant" | "occupied" | "reserved" | "maintenance";
  beds: number;
  price: number;
};

type Floor = {
  id: string;
  name: string;
  rooms: Room[];
};

function statusColor(s: Room["status"]) {
  switch (s) {
    case "vacant":
      return "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-200";
    case "occupied":
      return "bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/40 dark:border-rose-700 dark:text-rose-200";
    case "reserved":
      return "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-200";
    case "maintenance":
      return "bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300";
  }
}

export default function FloorMapPage() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const me = await userService.getProfile();
        // load buildings (backend should scope to host unless user is admin)
        const bRes = await buildingService.getAll({ page: 1, limit: 200 });
        setBuildings(bRes.items || []);

        // choose default building
        const first = (bRes.items || [])[0];
        if (first) {
          setSelectedBuildingId(first.id);
        } else {
          // if no building, still try to load apartments without building (owner's apartments)
          setSelectedBuildingId(null);
        }

        // initial load apartments for selected building (if any)
        if (first) await loadApartmentsForBuilding(first.id, me.role === 'admin');
        else await loadApartmentsForBuilding(undefined, me.role === 'admin');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadApartmentsForBuilding = async (buildingId?: number, isAdmin = false) => {
    setLoading(true);
    try {
      const params: any = { page: 1, limit: 500 };
      if (buildingId !== undefined && buildingId !== null) params.buildingId = buildingId;
      // backend will filter by owner based on JWT unless admin
      const res = await apartmentService.getAll(params);
      const items: Apartment[] = res.items || [];

      // group by floorNumber (descending) – apartments with no floorNumber go to floor 1
      const map = new Map<number, Room[]>();
      for (const a of items) {
        const floorNum = a.floorNumber ?? 1;
        const rooms = map.get(floorNum) || [];
        // map apartment to Room
        const room: Room = {
          id: a.id,
          name: a.roomCode || a.title || String(a.id),
          status: a.status === 'published' ? 'vacant' : 'maintenance',
          beds: a.bedrooms ?? 0,
          price: Number(String(a.rentPrice || '0').replace(/,/g, '')) || 0,
        };
        rooms.push(room);
        map.set(floorNum, rooms);
      }

      const floorNums = Array.from(map.keys()).sort((a, b) => b - a);
      const newFloors: Floor[] = floorNums.map((fn) => ({ id: `f-${fn}`, name: `Tầng ${fn}`, rooms: map.get(fn) || [] }));
      setFloors(newFloors);
    } catch (err) {
      console.error(err);
      setFloors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Sơ đồ căn hộ</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Xem trạng thái phòng theo từng tầng và chi tiết từng phòng</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/quan-ly-chu-nha" className="text-sm text-emerald-700 dark:text-emerald-400 hover:underline">Quay về Bảng tin</Link>
        </div>
      </div>

      <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Chọn tòa nhà</label>
        <select
          className="h-10 w-full max-w-md rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          value={selectedBuildingId ?? ""}
          onChange={async (e) => {
            const v = e.target.value;
            const parsed = v === "" ? undefined : Number(v);
            setSelectedBuildingId(parsed ?? null);
            await loadApartmentsForBuilding(parsed);
          }}
        >
          <option value="">-- Tất cả / Không thuộc tòa --</option>
          {buildings.map(b => (<option key={b.id} value={String(b.id)}>{`${b.id} - ${(b as any).name ?? ''}`}</option>))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-10">Đang tải sơ đồ…</div>
          ) : floors.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">Không tìm thấy căn hộ nào.</p>
            </div>
          ) : floors.map((floor) => (
            <Panel key={floor.id} title={floor.name} className="!px-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {floor.rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`w-full text-left p-3 rounded-lg border ${statusColor(room.status)} hover:shadow-lg transition relative group`}
                  >
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                      {room.status === 'vacant' ? 'Trống' : room.status === 'occupied' ? 'Đã thuê' : room.status === 'reserved' ? 'Cọc' : 'Bảo trì'}
                    </div>

                    <div className="mt-4 mb-2">
                      <div className="font-bold text-lg mb-0.5">{room.name}</div>
                      <div className="text-xs opacity-80">{room.beds} giường</div>
                    </div>

                    <div className="font-medium text-sm">
                      {typeof room.price === 'number' ? fNumber(room.price) : room.price ? String(room.price) : '0'}
                      <span className="text-xs opacity-70 font-normal"> đ</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      </div>    </div>
  );
}
