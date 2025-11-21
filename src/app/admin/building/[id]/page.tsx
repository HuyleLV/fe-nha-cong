"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Save, ChevronRight, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { Building, BuildingForm } from "@/type/building";
import { buildingService } from "@/services/buildingService";
import AdminTable from "@/components/AdminTable";
import Pagination from "@/components/Pagination";
import Spinner from "@/components/spinner";
import UploadPicker from "@/components/UploadPicker";
import { toSlug } from "@/utils/formatSlug";
import { apartmentService } from "@/services/apartmentService";
import type { Apartment } from "@/type/apartment";
import { formatMoneyVND } from "@/utils/format-number";
// Viewings calendar moved to dedicated page
import LocationLookup from "../../components/locationLookup";
import type { Location } from "@/type/location";
import { tApartmentStatus } from "../../i18n";
// Calendar UI moved to /admin/building/[id]/calendar

const inputCls =
  "h-10 w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white";
const textAreaCls =
  "w-full rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 p-3 bg-white";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
      <ChevronRight className="w-4 h-4 text-slate-400" />
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

function BuildingAdminDetailInner() {
  const { id } = useParams<{ id: string }>();
  const isEdit = useMemo(() => id !== "create", [id]);
  const router = useRouter();
  const sp = useSearchParams();

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [detail, setDetail] = useState<Building | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Apartments pagination/state
  const aPage = Number(sp.get("aPage") || 1);
  const aLimit = Number(sp.get("aLimit") || 10);

  // Viewings calendar removed from this page

  const [apartments, setApartments] = useState<Apartment[]>([]);
  // Grouped by floor for display
  const groupedByFloor = useMemo(() => {
    const map = new Map<number | 'unknown', Apartment[]>();
    apartments.forEach((a) => {
      const floor = (a as any).floorNumber;
      const key: number | 'unknown' = floor && floor > 0 ? floor : 'unknown';
      map.set(key, [...(map.get(key) || []), a]);
    });
    // sort numeric floors ascending, unknown last
    return Array.from(map.entries()).sort((a, b) => {
      if (a[0] === 'unknown' && b[0] === 'unknown') return 0;
      if (a[0] === 'unknown') return 1;
      if (b[0] === 'unknown') return -1;
      return Number(a[0]) - Number(b[0]);
    });
  }, [apartments]);
  const [aMeta, setAMeta] = useState<{ total: number; page: number; limit: number; pageCount: number }>({ total: 0, page: 1, limit: 10, pageCount: 1 });

  // const [viewings, setViewings] = useState<Viewing[]>([]);

  // Form state
  const [form, setForm] = useState<BuildingForm>({
    name: "",
    slug: "",
    address: "",
    locationId: undefined,
    lat: "",
    lng: "",
    floors: 0,
    units: 0,
    yearBuilt: undefined,
    coverImageUrl: "",
    images: "",
    description: "",
    status: "active",
  });

  const onChange = (k: keyof BuildingForm, v: any) => setForm((s) => ({ ...s, [k]: v }));

  // Options for nicer manual selection
  const floorOptions = useMemo(() => Array.from({ length: 51 }, (_, i) => i), []); // 0..50
  const unitOptions = useMemo(() => Array.from({ length: 501 }, (_, i) => i), []); // 0..500
  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    const arr: number[] = [];
    for (let y = now; y >= 1980; y--) arr.push(y);
    return arr;
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const b = await buildingService.getById(Number(id));
        setDetail(b);
        setForm({
          name: b.name,
          slug: b.slug,
          address: b.address || "",
          locationId: b.locationId || undefined,
          lat: b.lat || "",
          lng: b.lng || "",
          floors: b.floors || 0,
          units: b.units || 0,
          yearBuilt: b.yearBuilt || undefined,
          coverImageUrl: b.coverImageUrl || "",
          images: b.images || "",
          description: b.description || "",
          status: b.status || "active",
  });
  setSelectedLocation(b.locationId ? { id: b.locationId, name: null, slug: null, level: "District", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as unknown as Location : null);
      } catch (e: any) {
        toast.error(e?.message || "Không tải được tòa nhà");
        router.replace("/admin/building");
        return;
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, router]);

  // Sync form.locationId when selectedLocation changes
  useEffect(() => {
    setForm((s) => ({ ...s, locationId: selectedLocation?.id ?? undefined }));
  }, [selectedLocation?.id]);

  // Load apartments in this building
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await apartmentService.getAll({ buildingId: Number(id), page: aPage, limit: aLimit });
        setApartments(res.items);
        setAMeta(res.meta as any);
      } catch {}
    })();
  }, [id, isEdit, aPage, aLimit]);

  // Viewings calendar moved to dedicated page

  const onSave = async () => {
    try {
      const payload: BuildingForm = {
        ...form,
        name: form.name.trim(),
        slug: (form.slug || toSlug(form.name)).trim(),
        address: form.address?.trim() || undefined,
        coverImageUrl: form.coverImageUrl?.trim() || undefined,
      };
      if (isEdit) await buildingService.update(Number(id), payload);
      else await buildingService.create(payload);
      toast.success(isEdit ? "Cập nhật tòa nhà thành công" : "Tạo tòa nhà thành công");
      if (!isEdit) router.replace("/admin/building");
    } catch (e: any) {
      toast.error(e?.message || "Lưu tòa nhà thất bại");
    }
  };

  // Status localization is handled in calendar page

  const onDelete = async () => {
    if (!isEdit) return;
    if (!confirm("Xoá tòa nhà này?")) return;
    try {
      await buildingService.remove(Number(id));
      toast.success("Đã xoá tòa nhà");
      router.replace("/admin/building");
    } catch (e: any) {
      toast.error(e?.message || "Không xoá được");
    }
  };

  const setParam = (key: string, val: string | number | undefined) => {
    const params = new URLSearchParams(sp.toString());
    if (val === undefined || val === "") params.delete(key);
    else params.set(key, String(val));
    router.replace(`/admin/building/${id}?${params.toString()}`);
  };

  if (isEdit && loading) {
    return (
      <div className="min-h-[300px] grid place-items-center"><Spinner /></div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">{isEdit ? "Chỉnh sửa tòa nhà" : "Tạo tòa nhà"}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">
                {form.name?.trim() || (isEdit ? `#${id}` : "Tòa nhà mới")}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEdit && (
              <button onClick={onDelete} className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onSave} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">
              <CheckCircle2 className="w-5 h-5" /> {isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        {/* LEFT: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Thông tin tòa nhà">
            <div className="space-y-3">
              <input className={inputCls} placeholder="Tên tòa nhà" value={form.name} onChange={(e) => onChange("name", e.target.value)} />
              <div className="flex items-center gap-2">
                <input className={`${inputCls} font-mono`} placeholder="slug" value={form.slug || ""} onChange={(e) => onChange("slug", e.target.value)} />
                <button type="button" onClick={() => onChange("slug", toSlug(form.name || ""))} className="h-10 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm cursor-pointer">Tạo</button>
              </div>
              {/* Đã chuyển Khu vực, Địa chỉ, Lat/Lng sang cột bên phải */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Số tầng</label>
                  <select
                    className={inputCls}
                    value={(form.floors ?? 0).toString()}
                    onChange={(e) => onChange("floors", Number(e.target.value))}
                  >
                    {floorOptions.map((n) => (
                      <option key={n} value={n}>{n === 0 ? "Chưa rõ (0)" : n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Số căn</label>
                  <select
                    className={inputCls}
                    value={(form.units ?? 0).toString()}
                    onChange={(e) => onChange("units", Number(e.target.value))}
                  >
                    {unitOptions.map((n) => (
                      <option key={n} value={n}>{n === 0 ? "Chưa rõ (0)" : n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Năm xây</label>
                  <select
                    className={inputCls}
                    value={form.yearBuilt ? String(form.yearBuilt) : ""}
                    onChange={(e) => onChange("yearBuilt", e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Không rõ</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <UploadPicker value={form.coverImageUrl || null} onChange={(v) => onChange("coverImageUrl", v || "")} />
              <textarea className={textAreaCls} rows={4} placeholder="Mô tả" value={form.description || ""} onChange={(e) => onChange("description", e.target.value)} />
              <div>
                <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
                <select className={inputCls} value={form.status || "active"} onChange={(e) => onChange("status", e.target.value)}>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                  <option value="draft">Nháp</option>
                </select>
              </div>
            </div>
          </Section>
        </div>

  {/* RIGHT: Quick stats and actions */}
        <div className="space-y-6">
          <Section title="Thống kê nhanh">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <div className="text-xs text-emerald-700">Số tầng</div>
                <div className="text-xl font-semibold text-emerald-900">{form.floors ?? detail?.floors ?? 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                <div className="text-xs text-blue-700">Số căn</div>
                <div className="text-xl font-semibold text-blue-900">{form.units ?? detail?.units ?? 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
                <div className="text-xs text-amber-700">Năm xây</div>
                <div className="text-xl font-semibold text-amber-900">{form.yearBuilt ?? detail?.yearBuilt ?? "-"}</div>
              </div>
            </div>
          </Section>

          {/* Vị trí & Địa chỉ chuyển sang cột phải */}
          <Section title="Vị trí & Địa chỉ">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Khu vực</label>
                <LocationLookup
                  value={selectedLocation}
                  onChange={(loc) => setSelectedLocation(loc)}
                />
              </div>
              <input className={inputCls} placeholder="Địa chỉ" value={form.address || ""} onChange={(e) => onChange("address", e.target.value)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className={inputCls} placeholder="Vĩ độ (lat)" value={form.lat || ""} onChange={(e) => onChange("lat", e.target.value)} />
                <input className={inputCls} placeholder="Kinh độ (lng)" value={form.lng || ""} onChange={(e) => onChange("lng", e.target.value)} />
              </div>
            </div>
          </Section>

        </div>
      </div>

      {/* Apartments list grouped by floor */}
      {isEdit && (
        <div className="p-4">
          <Section title="Danh sách căn hộ theo tầng">
            {groupedByFloor.map(([floor, list]) => (
              <div key={String(floor)} className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-700">
                    {floor === 'unknown' ? 'Chưa rõ tầng' : `Tầng ${floor}`} <span className="text-slate-500 font-normal">({list.length} căn)</span>
                  </h4>
                </div>
                <AdminTable headers={["ID", "Tiêu đề", "Giá", "Trạng thái", "Hành động"]}>
                  {list.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{a.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{a.title}</span>
                          <span className="text-xs text-slate-500">/{a.slug}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{a.rentPrice ? formatMoneyVND(Number(String(a.rentPrice).replace(/,/g, ''))) : '-'} {a.currency}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.status === 'published' ? 'bg-green-100 text-green-700' : a.status === 'draft' ? 'bg-slate-200 text-slate-700' : a.status === 'archived' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{tApartmentStatus(a.status)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/apartment/${a.id}`} className="text-emerald-700 hover:underline">Sửa</Link>
                      </td>
                    </tr>
                  ))}
                </AdminTable>
              </div>
            ))}
            <Pagination
              page={aMeta.page}
              totalPages={aMeta.pageCount}
              onPrev={() => setParam("aPage", Math.max(1, aMeta.page - 1))}
              onNext={() => setParam("aPage", Math.min(aMeta.pageCount, aMeta.page + 1))}
              onPageChange={(p) => setParam("aPage", p)}
            />
          </Section>
        </div>
      )}

      {/* Attach existing apartments without building */}
      {isEdit && (
        <AttachUnassignedApartments buildingId={Number(id)} locationId={form.locationId} onAttached={() => {
          // refresh lists
          setParam("aPage", aMeta.page); // trigger reload by changing URL param to same page
        }} />
      )}

      {/* Lịch đặt phòng đã được chuyển sang trang riêng: /admin/building/[id]/calendar */}
    </div>
  );
}

// Sub-component: attach unassigned apartments to this building
function AttachUnassignedApartments({ buildingId, locationId, onAttached }: { buildingId: number; locationId?: number; onAttached?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Apartment[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  const limit = 10;
  const [pageCount, setPageCount] = useState(1);
  const [attachFloor, setAttachFloor] = useState<number | ''>('');

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apartmentService.getAll({ page, limit, locationId });
      const arr = (res.items || []).filter((a) => !a.buildingId);
      setItems(arr);
  const pc = (res as any)?.meta?.pageCount ?? (res.meta as any)?.totalPages ?? 1;
  setPageCount(pc);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, locationId]);

  const toggle = (id: number, checked: boolean) => setSelected((s) => ({ ...s, [id]: checked }));

  const attach = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    if (!ids.length) return;
    try {
      await Promise.all(ids.map((aid) => apartmentService.update(aid, {
        buildingId: buildingId,
        imagesStrategy: "merge",
        // only apply floorNumber if valid >=1
        ...(attachFloor && attachFloor > 0 ? { floorNumber: attachFloor } : {}),
      })));
      toast.success("Đã gán căn hộ vào tòa nhà");
      setSelected({});
      await fetchList();
      onAttached?.();
    } catch (e: any) {
      toast.error(e?.message || "Không thể gán căn hộ");
    }
  };

  return (
    <div className="p-4">
      <Section title="Gán căn hộ chưa có toà vào tòa nhà này">
        <div className="mb-3 text-sm text-slate-600">Chỉ hiển thị các căn hộ chưa có Building. Bạn có thể lọc theo khu vực bằng trường Khu vực ở phần thông tin tòa nhà.</div>
        <AdminTable headers={["Chọn", "ID", "Tiêu đề", "Giá", "Khu vực"]} loading={loading}>
          {items.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <input type="checkbox" checked={!!selected[a.id]} onChange={(e) => toggle(a.id, e.target.checked)} />
              </td>
              <td className="px-4 py-3">{a.id}</td>
              <td className="px-4 py-3">{a.title}</td>
              <td className="px-4 py-3">{a.rentPrice ? formatMoneyVND(Number(String(a.rentPrice).replace(/,/g, ''))) : '-'} {a.currency}</td>
              <td className="px-4 py-3">{a.locationId ?? "-"}</td>
            </tr>
          ))}
        </AdminTable>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={attachFloor === '' ? '' : attachFloor}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) setAttachFloor(''); else setAttachFloor(Number(v));
              }}
              placeholder="Tầng (tuỳ chọn)"
              className="h-10 w-32 rounded-lg border border-slate-300/80 focus:border-emerald-500 focus:ring-emerald-500 px-3 bg-white text-sm"
            />
            <button onClick={attach} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">
              Gán vào tòa
            </button>
          </div>
          <div>
            <Pagination page={page} totalPages={pageCount} onPrev={() => setPage(Math.max(1, page - 1))} onNext={() => setPage(Math.min(pageCount, page + 1))} onPageChange={(p) => setPage(p)} />
          </div>
        </div>
      </Section>
    </div>
  );
}

export default function BuildingAdminDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] grid place-items-center"><Spinner /></div>}>
      <BuildingAdminDetailInner />
    </Suspense>
  );
}
