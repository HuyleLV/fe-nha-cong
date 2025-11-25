"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import RoomCardItem from "./roomCardItem";
import { Apartment } from "@/type/apartment";

type Props = {
  title?: string;
  subtitle?: string;
  districtsOrder?: string[];
  data: Apartment[];
  onToggleFav?: (roomId: Apartment["id"]) => void;
  onBook?: (room: Apartment) => void;
  onSeeAll?: (district: string) => void;

  // bổ sung API hiển thị
  onlyDistrict?: string;            // nếu truyền → chỉ render quận này
  showTabs?: boolean;               // ẩn/hiện tabs
  variant?: "grid" | "scroll";      // "scroll" = 1 hàng cuộn ngang
};

const districtOf = (apt: Apartment): string => {
  const byLocation = apt?.location?.name?.trim() || "";
  const byPath = apt?.addressPath?.split(",")?.[0]?.trim() || "";
  return byLocation || byPath || "";
};

export default function DistrictListingSection({
  title = "Các khu vực nhà trọ tại Hà Nội",
  subtitle = "Hãy chọn khu vực bạn muốn",
  districtsOrder,
  data,
  onToggleFav,
  onBook,
  onSeeAll,
  onlyDistrict,
  showTabs = true,
  variant = "grid",
}: Props) {
  // Khi ẩn tabs và không chỉ định onlyDistrict -> hiển thị tất cả items
  const showAll = !showTabs && !onlyDistrict;

  // Chuẩn hoá items kèm district string
  const itemsRaw = useMemo(
    () => (data ?? []).map((apt) => ({ apt, district: districtOf(apt) })),
    [data]
  );
  // Nếu showAll -> KHÔNG lọc theo district (kể cả rỗng). Ngược lại, bỏ item không có district.
  const items = useMemo(
    () => (showAll ? itemsRaw : itemsRaw.filter((x) => !!x.district)),
    [itemsRaw, showAll]
  );

  // Danh sách quận (unique + theo thứ tự districtsOrder nếu có)
  const districts = useMemo(() => {
    const uniq = Array.from(new Set(items.map((x) => x.district)));
    if (!districtsOrder?.length) return uniq;
    const inOrder = districtsOrder.filter((d) => uniq.includes(d));
    const rest = uniq.filter((d) => !inOrder.includes(d));
    return [...inOrder, ...rest];
  }, [items, districtsOrder]);

  // Active district
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (onlyDistrict) {
      setActive(onlyDistrict);
      return;
    }
    if (!active || !districts.includes(active)) {
      setActive(districts[0] ?? "");
    }
  }, [onlyDistrict, districts, active]);

  // Dữ liệu đã lọc theo quận đang active
  const filtered = useMemo(() => {
    if (showAll) return items.map((x) => x.apt);
    if (!active) return [];
    return items.filter((x) => x.district === active).map((x) => x.apt);
  }, [items, active, showAll]);

  // Chỉ hiển thị tối đa 10 item, chia thành 2 hàng x 5 item
  const displayed = useMemo(() => filtered.slice(0, 10), [filtered]);

  const showHeaderTabs = !onlyDistrict && showTabs;

  return (
    <section className="w-full rounded-3xl bg-[#087748] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        {subtitle && <p className="mt-1 text-white/80 text-sm md:text-base">{subtitle}</p>}
      </div>

      {/* Tabs (ẩn khi onlyDistrict hoặc showTabs=false) */}
      {showHeaderTabs && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {districts.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setActive(d)}
              className={clsx(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                active === d
                  ? "bg-white text-emerald-700 border-white"
                  : "bg-emerald-800 text-white border-white/20 hover:bg-emerald-700"
              )}
              aria-pressed={active === d}
            >
              {d}
            </button>
          ))}
          {!!active && (
            <a 
              href="/tim-phong-quanh-day" 
              className="ml-auto gap-1 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm border border-white/20 hover:bg-white/15"
            >
              <button
                type="button"
                onClick={() => onSeeAll?.(active)}
                className="inline-flex items-center cursor-pointer"
              >
                  Xem tất cả <ArrowRight className="h-4 w-4" />
              </button>
            </a>
          )}
        </div>
      )}

      {/* Empty state */}
      {(showAll ? items.length === 0 : !active || filtered.length === 0) ? (
        <div className="mt-6 rounded-xl bg-white/5 p-6 text-center text-white/80">
          {showAll
            ? (items.length === 0
                ? "Chưa có dữ liệu để hiển thị."
                : "")
            : (districts.length === 0
                ? "Chưa có dữ liệu khu vực để hiển thị."
                : "Chưa có phòng khả dụng trong khu vực đã chọn.")}
        </div>
      ) : variant === "grid" ? (
        // GRID
        <div className="mt-6 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-5 md:gap-4">
          {displayed.map((apt) => (
            <RoomCardItem
              key={apt.id}
              item={apt}
              onToggleFav={onToggleFav}
              onBook={onBook}
            />
          ))}
        </div>
      ) : (
        // SCROLL: 1 hàng, cuộn ngang
        <div className="mt-6 grid grid-cols-1 items-stretch gap-3 md:gap-4">
          <div className="flex gap-3 md:gap-4">
            {displayed.map((apt) => (
              <div
                key={apt.id}
                className="min-w-[240px] sm:min-w-[260px] md:min-w-[280px]"
              >
                <RoomCardItem
                  item={apt}
                  onToggleFav={onToggleFav}
                  onBook={onBook}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}