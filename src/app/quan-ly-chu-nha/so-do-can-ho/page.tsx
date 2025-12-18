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
      return "bg-emerald-100 border-emerald-300 text-emerald-700";
    case "occupied":
      return "bg-rose-100 border-rose-300 text-rose-700";
    case "reserved":
      return "bg-amber-100 border-amber-300 text-amber-700";
    case "maintenance":
      return "bg-slate-100 border-slate-300 text-slate-700";
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
        const me = await userService.getMe();
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
          <h1 className="text-2xl font-semibold">Sơ đồ căn hộ</h1>
          <p className="text-sm text-slate-600">Xem trạng thái phòng theo từng tầng và chi tiết từng phòng</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/quan-ly-chu-nha" className="text-sm text-emerald-700 hover:underline">Quay về Bảng tin</Link>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-slate-600 mb-1">Chọn tòa nhà</label>
        <select className="h-10 rounded-lg border border-slate-300 px-3" value={selectedBuildingId ?? ""} onChange={async (e) => {
          const v = e.target.value;
          const parsed = v === "" ? undefined : Number(v);
          setSelectedBuildingId(parsed ?? null);
          await loadApartmentsForBuilding(parsed);
        }}>
          <option value="">-- Tất cả / Không thuộc tòa --</option>
          {buildings.map(b => (<option key={b.id} value={String(b.id)}>{b.name || b.title || `Tòa nhà #${b.id}`}</option>))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-slate-500">Đang tải sơ đồ…</div>
          ) : floors.length === 0 ? (
            <div className="text-sm text-slate-500">Không tìm thấy căn hộ nào.</div>
          ) : floors.map((floor) => (
            <Panel key={floor.id} title={floor.name} className="!px-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {floor.rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`w-full text-left p-3 rounded-lg border ${statusColor(room.status)} hover:shadow-lg transition relative`}
                  >
                    <div className="absolute top-10 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-white/70">
                      {room.status === 'vacant' ? 'Trống' : room.status === 'occupied' ? 'Đã thuê' : room.status === 'reserved' ? 'Đang cọc' : 'Bảo trì'}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Phòng {room.name}</div>
                      <div className="text-xs">{room.beds} giường</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-700">{typeof room.price === 'number' ? fNumber(room.price) : room.price ? String(room.price) : ''} đ</div>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
