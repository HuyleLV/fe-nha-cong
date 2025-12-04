// app/admin/apartments/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Edit, Trash2, Plus, MapPin, Filter, SlidersHorizontal, RotateCcw, CalendarDays, Search } from "lucide-react";

import Spinner from "@/components/spinner";
import Pagination from "@/components/Pagination";
import AdminTable from "@/components/AdminTable";
import { formatDateTime } from "@/utils/format-time";
import { apartmentService } from "@/services/apartmentService";
import LocationLookup from "../components/locationLookup";
import { Apartment, ApartmentStatus } from "@/type/apartment";
import { Location } from "@/type/location";

const LIMIT = 10;

/** helpers */
const toNum = (v?: string | number | null) => {
  if (v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
};

/** --- Mini components nội bộ file --- */
function ToggleChip({ active, onToggle, children }: { active: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-1 rounded-full border text-sm transition
        ${active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 hover:bg-slate-50"}`}
    >
      {children}
    </button>
  );
}

function FiltersSection(props: {
  // state & handlers
  search: string; setSearch: (v: string) => void;
  status: ApartmentStatus | ""; setStatus: (v: ApartmentStatus | "") => void;
  selectedLocation: Location | null; setSelectedLocation: (l: Location | null) => void;
  minPrice: string; setMinPrice: (v: string) => void;
  maxPrice: string; setMaxPrice: (v: string) => void;
  minArea: string; setMinArea: (v: string) => void;
  maxArea: string; setMaxArea: (v: string) => void;
  bedrooms: string; setBedrooms: (v: string) => void;
  bathrooms: string; setBathrooms: (v: string) => void;

  hasPrivateBathroom: boolean; setHasPrivateBathroom: (v: boolean) => void;
  hasMezzanine: boolean; setHasMezzanine: (v: boolean) => void;
  noOwnerLiving: boolean; setNoOwnerLiving: (v: boolean) => void;
  hasAirConditioner: boolean; setHasAirConditioner: (v: boolean) => void;
  hasWaterHeater: boolean; setHasWaterHeater: (v: boolean) => void;
  hasWashingMachine: boolean; setHasWashingMachine: (v: boolean) => void;
  hasWardrobe: boolean; setHasWardrobe: (v: boolean) => void;
  flexibleHours: boolean; setFlexibleHours: (v: boolean) => void;
  hasElevator: boolean; setHasElevator: (v: boolean) => void;
  allowPet: boolean; setAllowPet: (v: boolean) => void;
  allowElectricVehicle: boolean; setAllowElectricVehicle: (v: boolean) => void;

  sort: "newest" | "price_asc" | "price_desc" | "area_desc";
  setSort: (v: "newest" | "price_asc" | "price_desc" | "area_desc") => void;

  onClearAll: () => void;
}) {
  const {
    search, setSearch,
    status, setStatus,
    selectedLocation, setSelectedLocation,
    minPrice, setMinPrice, maxPrice, setMaxPrice,
    minArea, setMinArea, maxArea, setMaxArea,
    bedrooms, setBedrooms, bathrooms, setBathrooms,
    hasPrivateBathroom, setHasPrivateBathroom,
    hasMezzanine, setHasMezzanine,
    noOwnerLiving, setNoOwnerLiving,
    hasAirConditioner, setHasAirConditioner,
    hasWaterHeater, setHasWaterHeater,
    hasWashingMachine, setHasWashingMachine,
    hasWardrobe, setHasWardrobe,
    flexibleHours, setFlexibleHours,
    hasElevator, setHasElevator,
    allowPet, setAllowPet,
    allowElectricVehicle, setAllowElectricVehicle,
    sort, setSort,
    onClearAll,
  } = props;

  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeCount = [
    search,
    status,
    selectedLocation?.id,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    hasPrivateBathroom,
    hasMezzanine,
    noOwnerLiving,
    hasAirConditioner,
    hasWaterHeater,
    hasWashingMachine,
    hasWardrobe,
    flexibleHours,
    hasElevator,
    allowPet,
    allowElectricVehicle,
    sort !== "newest" ? "sort" : "",
  ].filter(Boolean).length;

  return (
    <div className="mt-4 border rounded-lg p-3 md:p-3.5 bg-white shadow-sm">
      {/* Header of filters */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-700">
          <Filter className="size-4" />
          <span className="font-medium">Bộ lọc</span>
          {activeCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs">{activeCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded border text-sm hover:bg-slate-50"
          >
            <SlidersHorizontal className="size-4" /> Nâng cao
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded border text-sm text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="size-4" /> Xoá lọc
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tiêu đề hoặc slug"
            className="h-9 w-56 rounded border pl-8 pr-3 text-sm outline-none focus:ring-2 ring-emerald-500"
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ApartmentStatus | "")}
          className="h-9 rounded border px-2 text-sm"
        >
          <option value="">Trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="published">Đã đăng</option>
          <option value="archived">Đã ẩn</option>
        </select>

        {/* Location */}
        <div className="min-w-[220px]">
          <LocationLookup
            value={selectedLocation}
            onChange={setSelectedLocation}
            placeholder="Khu vực"
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="h-9 rounded border px-2 text-sm"
        >
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá ↑</option>
          <option value="price_desc">Giá ↓</option>
          <option value="area_desc">Diện tích lớn</option>
        </select>

        {/* Giá */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Giá</span>
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Từ"
            className="h-9 w-28 rounded border px-2 text-sm"
            inputMode="numeric"
          />
          <span className="text-slate-400">-</span>
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Đến"
            className="h-9 w-28 rounded border px-2 text-sm"
            inputMode="numeric"
          />
        </div>

        {/* Diện tích */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Diện tích</span>
          <input
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            placeholder="Từ"
            className="h-9 w-24 rounded border px-2 text-sm"
            inputMode="numeric"
          />
          <span className="text-slate-400">-</span>
          <input
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value)}
            placeholder="Đến"
            className="h-9 w-24 rounded border px-2 text-sm"
            inputMode="numeric"
          />
          <span className="text-xs text-slate-500">m²</span>
        </div>

        {/* Phòng ngủ/tắm */}
        <input
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          placeholder="Ngủ ≥"
          className="h-9 w-24 rounded border px-2 text-sm"
          inputMode="numeric"
        />
        <input
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
          placeholder="Tắm ≥"
          className="h-9 w-24 rounded border px-2 text-sm"
          inputMode="numeric"
        />
      </div>

      {/* Nâng cao */}
      {showAdvanced && (
        <div className="mt-3 border-t pt-3">
          <div className="text-xs text-slate-600 mb-2">Tiện nghi</div>
          <div className="flex flex-wrap gap-1.5">
            <div className="text-[13px]"><ToggleChip active={hasPrivateBathroom} onToggle={() => setHasPrivateBathroom(!hasPrivateBathroom)}>VS khép kín</ToggleChip></div>
            <div className="text-[13px]"><ToggleChip active={hasMezzanine} onToggle={() => setHasMezzanine(!hasMezzanine)}>Gác xép</ToggleChip></div>
            <div className="text-[13px]"><ToggleChip active={noOwnerLiving} onToggle={() => setNoOwnerLiving(!noOwnerLiving)}>Không chung chủ</ToggleChip></div>
            <div className="text-[13px]"><ToggleChip active={hasAirConditioner} onToggle={() => setHasAirConditioner(!hasAirConditioner)}>Điều hoà</ToggleChip></div>
            <div className="text-[13px]"><ToggleChip active={hasWaterHeater} onToggle={() => setHasWaterHeater(!hasWaterHeater)}>Nóng lạnh</ToggleChip></div>
            <div className="text-[13px]"><ToggleChip active={hasWashingMachine} onToggle={() => setHasWashingMachine(!hasWashingMachine)}>Máy giặt</ToggleChip></div>
            <div className="text-[13px]"><ToggleChip active={hasWardrobe} onToggle={() => setHasWardrobe(!hasWardrobe)}>Tủ quần áo</ToggleChip></div>
            <div className="text-[13px]"><ToggleChip active={flexibleHours} onToggle={() => setFlexibleHours(!flexibleHours)}>Giờ linh hoạt</ToggleChip></div>
            <div className="text-[13px]"><ToggleChip active={hasElevator} onToggle={() => setHasElevator(!hasElevator)}>Thang máy</ToggleChip></div>
            <div className="text-[13px]"><ToggleChip active={allowPet} onToggle={() => setAllowPet(!allowPet)}>Cho nuôi pet</ToggleChip></div>
            <div className="text-[13px]"><ToggleChip active={allowElectricVehicle} onToggle={() => setAllowElectricVehicle(!allowElectricVehicle)}>Xe điện</ToggleChip></div>
          </div>
        </div>
      )}
    </div>
  );
}

/** --- Trang chính --- */
export default function AdminApartmentsPage() {
  const router = useRouter();

  // data
  const [items, setItems] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // paging
  const [page, setPage] = useState(1);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / LIMIT)), [total]);

  // filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApartmentStatus | "">("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [minArea, setMinArea] = useState<string>("");
  const [maxArea, setMaxArea] = useState<string>("");

  const [bedrooms, setBedrooms] = useState<string>("");
  const [bathrooms, setBathrooms] = useState<string>("");

  const [hasPrivateBathroom, setHasPrivateBathroom] = useState(false);
  const [hasMezzanine, setHasMezzanine] = useState(false);
  const [noOwnerLiving, setNoOwnerLiving] = useState(false);
  const [hasAirConditioner, setHasAirConditioner] = useState(false);
  const [hasWaterHeater, setHasWaterHeater] = useState(false);
  const [hasWashingMachine, setHasWashingMachine] = useState(false);
  const [hasWardrobe, setHasWardrobe] = useState(false);
  const [flexibleHours, setFlexibleHours] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [allowPet, setAllowPet] = useState(false);
  const [allowElectricVehicle, setAllowElectricVehicle] = useState(false);

  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc" | "area_desc">("newest");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { items, meta } = await apartmentService.getAll({
        page,
        limit: LIMIT,
        q: search || undefined,
        status: status || undefined,
        locationId: selectedLocation?.id,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minArea: minArea ? Number(minArea) : undefined,
        maxArea: maxArea ? Number(maxArea) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        hasPrivateBathroom: hasPrivateBathroom || undefined,
        hasMezzanine: hasMezzanine || undefined,
        noOwnerLiving: noOwnerLiving || undefined,
        hasAirConditioner: hasAirConditioner || undefined,
        hasWaterHeater: hasWaterHeater || undefined,
        hasWashingMachine: hasWashingMachine || undefined,
        hasWardrobe: hasWardrobe || undefined,
        flexibleHours: flexibleHours || undefined,
  hasElevator: hasElevator || undefined,
  allowPet: allowPet || undefined,
  allowElectricVehicle: allowElectricVehicle || undefined,
        sort,
      });

      setItems(items || []);
      setTotal(meta?.total || 0);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || e?.message || "Không tải được danh sách căn hộ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData();
  }, [
    status,
    selectedLocation,
    bedrooms,
    bathrooms,
    hasPrivateBathroom,
    hasMezzanine,
    noOwnerLiving,
    hasAirConditioner,
    hasWaterHeater,
    hasWashingMachine,
    hasWardrobe,
    flexibleHours,
    hasElevator,
    allowPet,
    allowElectricVehicle,
    sort,
  ]);

  // đổi trang
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // debounce cho search/price/area
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, minPrice, maxPrice, minArea, maxArea]);

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < totalPages && setPage(page + 1);

  const clearAll = () => {
    setSearch("");
    setStatus("");
    setSelectedLocation(null);
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setBedrooms("");
    setBathrooms("");
    setHasPrivateBathroom(false);
    setHasMezzanine(false);
    setNoOwnerLiving(false);
    setHasAirConditioner(false);
    setHasWaterHeater(false);
    setHasWashingMachine(false);
    setHasWardrobe(false);
  setFlexibleHours(false);
  setHasElevator(false);
  setAllowPet(false);
  setAllowElectricVehicle(false);
    setSort("newest");
    setPage(1);
    fetchData();
  };

  if (loading)
    return (
      <div className="min-h-[400px] grid place-items-center">
        <Spinner />
      </div>
    );

  return (
  <div className="mx-auto max-w-screen-2xl p-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-emerald-900">QUẢN LÝ CĂN HỘ</h1>
        <button
          onClick={() => router.push("/admin/apartment/create")}
          title="Thêm căn hộ"
          aria-label="Thêm căn hộ"
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* Filters (gọn trong 1 section) */}
      <FiltersSection
        search={search} setSearch={setSearch}
        status={status} setStatus={setStatus}
        selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
        minPrice={minPrice} setMinPrice={setMinPrice}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        minArea={minArea} setMinArea={setMinArea}
        maxArea={maxArea} setMaxArea={setMaxArea}
        bedrooms={bedrooms} setBedrooms={setBedrooms}
        bathrooms={bathrooms} setBathrooms={setBathrooms}
        hasPrivateBathroom={hasPrivateBathroom} setHasPrivateBathroom={setHasPrivateBathroom}
        hasMezzanine={hasMezzanine} setHasMezzanine={setHasMezzanine}
        noOwnerLiving={noOwnerLiving} setNoOwnerLiving={setNoOwnerLiving}
        hasAirConditioner={hasAirConditioner} setHasAirConditioner={setHasAirConditioner}
        hasWaterHeater={hasWaterHeater} setHasWaterHeater={setHasWaterHeater}
        hasWashingMachine={hasWashingMachine} setHasWashingMachine={setHasWashingMachine}
        hasWardrobe={hasWardrobe} setHasWardrobe={setHasWardrobe}
        flexibleHours={flexibleHours} setFlexibleHours={setFlexibleHours}
        hasElevator={hasElevator} setHasElevator={setHasElevator}
        allowPet={allowPet} setAllowPet={setAllowPet}
        allowElectricVehicle={allowElectricVehicle} setAllowElectricVehicle={setAllowElectricVehicle}
        sort={sort} setSort={setSort}
        onClearAll={clearAll}
      />

      {/* Table */}
      <AdminTable
        headers={[
          "ID",
          "Tiêu đề",
          "Slug",
          "Giá thuê",
          "Diện tích",
          "Phòng",
          "Khu vực",
          "Trạng thái",
          "Đã duyệt",
          "Cập nhật",
          "Thao tác",
        ]}
      >
        {items.map((it) => {
          const price = toNum(it.rentPrice);
          const area = toNum(it.areaM2);

          return (
            <tr key={it.id} className="hover:bg-slate-50 transition-colors text-[14px]">
              <td className="px-4 py-3">{it.id}</td>
              <td className="px-4 py-3 font-medium">{it.title}</td>
              <td className="px-4 py-3 text-slate-600">{it.slug}</td>
              <td className="px-4 py-3">
                {price !== undefined ? price.toLocaleString("vi-VN") : "-"} {it.currency || "VND"}
              </td>
              <td className="px-4 py-3">{area !== undefined ? `${area.toLocaleString("vi-VN")} m²` : "-"}</td>
              <td className="px-4 py-3">{it.bedrooms} ngủ · {it.bathrooms} tắm</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4 text-emerald-600" />
                  {it.addressPath || it.location?.name}
                </span>
              </td>
              <td className="px-4 py-3">
                {(() => {
                  const s = it.status;
                  let label = String(s);
                  let cls = "bg-slate-200 text-slate-700";
                  if (s === "published") {
                    label = "Đã đăng";
                    cls = "bg-green-100 text-green-700";
                  } else if (s === "draft") {
                    label = "Nháp";
                    cls = "bg-amber-100 text-amber-700";
                  } else if (s === "archived") {
                    label = "Đã ẩn";
                    cls = "bg-slate-200 text-slate-700";
                  }
                  return (
                    <span className={`px-2 py-0.5 rounded text-sm ${cls}`}>{label}</span>
                  );
                })()}
              </td>

              <td className="px-4 py-3 text-center">
                {(() => {
                  const approved = (it as any).isApproved ?? (it as any).is_approved;
                  const ok = Boolean(approved);
                  return (
                    <span className={`px-2 py-0.5 rounded text-sm ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {ok ? 'Đã duyệt' : 'Chưa duyệt'}
                    </span>
                  );
                })()}
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDateTime(it.updatedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => router.push(`/admin/apartment/${it.id}`)}
                    title="Sửa căn hộ"
                    aria-label="Sửa căn hộ"
                    className="flex items-center justify-center p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition cursor-pointer"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => router.push(`/admin/viewings?apartmentId=${it.id}`)}
                    title="Lịch xem"
                    aria-label="Lịch xem"
                    className="flex items-center justify-center p-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <CalendarDays size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      const ok = confirm(`Xoá "${it.title}"?`);
                      if (!ok) return;
                      try {
                        await apartmentService.delete(it.id);
                        toast.success("Đã xoá");
                        setItems((prev) => prev.filter((x) => x.id !== it.id));
                        setTotal((t) => Math.max(0, t - 1));
                      } catch (e: any) {
                        toast.error(e?.response?.data?.message || "Không xoá được");
                      }
                    }}
                    title="Xóa căn hộ"
                    aria-label="Xóa căn hộ"
                    className="flex items-center justify-center p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
