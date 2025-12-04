"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { CheckCircle2 } from 'lucide-react';
import { useParams, useRouter } from "next/navigation";
// Panel removed — using page header layout consistent with other host pages
import { buildingService } from '@/services/buildingService';
import { apartmentService } from '@/services/apartmentService';
import UploadPicker from '@/components/UploadPicker';
import AdminTable from '@/components/AdminTable';
import { meterReadingService } from '@/services/meterReadingService';
import { toast } from 'react-toastify';

type ItemRow = {
  id: string;
  name: string;
  previousIndex?: string;
  newIndex?: string;
  readingDate?: string;
  image?: string | null;
};

export default function GhiChiSoEditPage() {
  const { id } = useParams() as { id: string };
  const isEdit = useMemo(() => id !== 'create', [id]);
  const router = useRouter();

  const [buildings, setBuildings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [apartmentId, setApartmentId] = useState<number | null>(null);
  const [meterType, setMeterType] = useState<'electricity' | 'water'>('electricity');
  const [period, setPeriod] = useState<string>(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  const [readingDate, setReadingDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Display helper: remove trailing zeros and trailing decimal point, e.g., "12.00" -> "12", "12.50" -> "12.5"
  const formatDisplayNumber = (v?: string | null) => {
    if (v === undefined || v === null) return '';
    let s = String(v);
    // normalize commas to dots for display
    s = s.replace(/,/g, '.');
    // only process if numeric-ish
    if (/^\d+(\.\d+)?$/.test(s)) {
      s = s.replace(/(\.\d*?)0+$/,'$1'); // trim trailing zeros after decimal
      s = s.replace(/\.$/,''); // trim trailing dot
    }
    return s;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await buildingService.getAll({ page: 1, limit: 200 });
        setBuildings(res.items || []);
      } catch (err) { setBuildings([]); }
    })();
  }, []);

  useEffect(() => {
    if (!buildingId) { setApartments([]); setApartmentId(null); return; }
    (async () => {
      try {
        const res = await apartmentService.getAll({ page:1, limit:200, buildingId });
        setApartments(res.items || []);
      } catch (err) { setApartments([]); }
    })();
  }, [buildingId]);

  // Auto-populate meter item rows when apartment or meterType changes (only for create mode).
  // Creates either both (electricity & water) or only the selected meterType.
  const prevApartmentRef = useRef<number | null>(null);
  useEffect(() => {
    // Do NOT auto-generate rows in edit mode to avoid overwriting loaded data
    if (isEdit) return;
    if (!apartmentId) {
      prevApartmentRef.current = null;
      return;
    }

    const apt = apartments.find(a => Number(a.id) === Number(apartmentId));
    if (!apt) return;

    const codePart = apt.roomCode ?? apt.code ?? apt.id;
    const namePart = (apt.title ?? apt.name ?? apt.roomCode ?? `#${apt.id}`).toString().replace(/\s+/g, ' ').trim();
    const makeLabel = (type: 'electricity' | 'water') => `${type === 'electricity' ? 'CTD' : 'CTN'}-${codePart}-${namePart}`;

    const types: Array<'electricity' | 'water'> = meterType ? [meterType] : ['electricity','water'];

    const newItems = types.map(t => ({ id: String(Date.now()) + Math.random().toString(36).slice(2,6), name: makeLabel(t), previousIndex: '', newIndex: '', readingDate, image: null }));

    // If apartment just changed or meterType changed, replace items with the generated ones (create mode only).
    setItems(newItems);

    // Prefill previousIndex from latest reading (same apartment + meterType)
    (async () => {
      try {
        const latest = await meterReadingService.getLatestByApartment(apartmentId, meterType);
        const latestData = (latest?.data ?? latest) as any;
        if (!latestData || !latestData.items || !latestData.items.length) return;
        const mapByName = new Map<string, any>();
        for (const it of latestData.items) mapByName.set(String(it.name), it);
        setItems((cur) => cur.map((it) => {
          const matched = mapByName.get(String(it.name));
          if (!matched) return it;
          // only prefill when empty to avoid overriding user input
          const prevEmpty = !it.previousIndex || String(it.previousIndex).trim() === '';
          return prevEmpty ? { ...it, previousIndex: matched.newIndex ?? it.previousIndex } : it;
        }));
      } catch (e) {
        // silent fail; prefill is best-effort
      }
    })();

    prevApartmentRef.current = apartmentId;
  }, [apartmentId, meterType, apartments, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const res = await meterReadingService.getById(Number(id));
        const data = (res?.data ?? res) as any;
        setBuildingId(data.buildingId || null);
        setApartmentId(data.apartmentId || null);
        setMeterType(data.meterType || 'electricity');
        setPeriod(data.period || period);
        setReadingDate(data.readingDate ? data.readingDate.slice(0,10) : readingDate);
        setItems((data.items || []).map((it: any) => ({ id: String(it.id), name: it.name, previousIndex: it.previousIndex ?? '', newIndex: it.newIndex ?? '', readingDate: it.readingDate ? it.readingDate.slice(0,10) : readingDate, image: (it.images && it.images.length) ? it.images[0] : null })));
      } catch (err) {
        console.error(err);
        toast.error('Không thể tải dữ liệu');
      } finally { setLoading(false); }
    })();
  }, [id, isEdit]);

  const monthsOptions = useMemo(() => {
    const out: string[] = [];
    const now = new Date();
    for (let i=0;i<24;i++){
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      out.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    }
    return out;
  }, []);

  // addRow removed — rows are auto-generated from apartment + meter type
  const removeRow = (id: string) => setItems((p) => p.filter((r) => r.id !== id));
  const updateRow = (id: string, patch: Partial<ItemRow>) => setItems((p) => p.map((r) => r.id === id ? { ...r, ...patch } : r));

  const onSave = async () => {
    if (!buildingId || !apartmentId) return toast.error('Vui lòng chọn tòa nhà và căn hộ');
    if (!items.length) return toast.error('Vui lòng thêm ít nhất 1 chỉ số');
    const sanitizeNumberString = (v?: string | null) => {
      if (v === undefined || v === null) return '0';
      const s = String(v).trim().replace(/,/g, '.');
      return s === '' ? '0' : s;
    };

    const payload = {
      buildingId,
      apartmentId,
      meterType,
      period,
      readingDate,
      items: items.map((it) => ({
        name: it.name,
        previousIndex: it.previousIndex && String(it.previousIndex).trim() !== '' ? String(it.previousIndex).trim().replace(/,/g, '.') : null,
        newIndex: sanitizeNumberString(it.newIndex),
        readingDate: it.readingDate || readingDate,
        images: it.image ? [it.image] : [],
      }))
    };

    try {
      setLoading(true);
      if (isEdit) {
        await meterReadingService.update(Number(id), payload);
        toast.success('Đã cập nhật ghi chỉ số');
      } else {
        await meterReadingService.create(payload);
        toast.success('Đã tạo ghi chỉ số');
      }
      router.push('/quan-ly-chu-nha/tai-chinh/ghi-chi-so');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Lỗi khi lưu');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">{isEdit ? 'Chỉnh sửa ghi chỉ số' : 'Tạo ghi chỉ số'}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">
                {isEdit ? `#${id}` : 'Ghi chỉ số mới'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onSave} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">
              <CheckCircle2 className="w-5 h-5" /> {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white mt-2 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-6 p-4">
          <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tòa nhà</label>
              <select className="w-full rounded-md border p-2" value={buildingId ?? ''} onChange={(e) => setBuildingId(e.target.value ? Number(e.target.value) : null)}>
                <option value="">-- Chọn tòa nhà --</option>
                {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Căn hộ</label>
              <select className="w-full rounded-md border p-2" value={apartmentId ?? ''} onChange={(e) => setApartmentId(e.target.value ? Number(e.target.value) : null)}>
                <option value="">-- Chọn căn hộ --</option>
                {apartments.map(a => <option key={a.id} value={a.id}>{a.title || a.roomCode || `#${a.id}`}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Loại công tơ</label>
              <select className="w-full rounded-md border p-2" value={meterType} onChange={(e) => setMeterType(e.target.value as any)}>
                <option value="electricity">Công tơ điện</option>
                <option value="water">Công tơ nước</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tháng chốt</label>
              <select className="w-full rounded-md border p-2" value={period} onChange={(e) => setPeriod(e.target.value)}>
                {monthsOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Ngày chốt</label>
              <input type="date" className="w-full rounded-md border p-2" value={readingDate} onChange={(e) => setReadingDate(e.target.value)} />
            </div>

            <div className="flex items-end"></div>
          </div>

          <AdminTable headers={["Tên công tơ", "Chỉ số cũ", "Chỉ số mới", "Ngày chốt", "Ảnh", "Hành động"]}>
            {items.length === 0 ? null : items.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 text-left"><input className="w-full border rounded p-2" value={r.name} onChange={(e) => updateRow(r.id, { name: e.target.value })} /></td>
                <td className="px-3 py-2 text-left"><input className="w-full border rounded p-2" value={formatDisplayNumber(r.previousIndex)} onChange={(e) => updateRow(r.id, { previousIndex: e.target.value })} /></td>
                <td className="px-3 py-2 text-left"><input className="w-full border rounded p-2" value={formatDisplayNumber(r.newIndex)} onChange={(e) => updateRow(r.id, { newIndex: e.target.value })} /></td>
                <td className="px-3 py-2 text-left"><input type="date" className="w-full border rounded p-2" value={r.readingDate || readingDate} onChange={(e) => updateRow(r.id, { readingDate: e.target.value })} /></td>
                <td className="px-3 py-2 text-left w-48">
                  <UploadPicker value={r.image || null} onChange={(v) => updateRow(r.id, { image: v })} />
                </td>
                <td className="px-3 py-2 text-center">
                  <button type="button" onClick={() => removeRow(r.id)} className="px-2 py-1 rounded bg-red-500 text-white">Xóa</button>
                </td>
              </tr>
            ))}
          </AdminTable>

          </div>
        </div>
      </div>
    </div>
  );
}
