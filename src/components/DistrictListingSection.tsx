"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import RoomCardItem, { RoomCard } from "./roomCardItem";

type Props = {
  title?: string;
  subtitle?: string;
  districtsOrder?: string[];
  data: RoomCard[];
  onToggleFav?: (roomId: RoomCard["id"]) => void;
  onBook?: (room: RoomCard) => void;
  onSeeAll?: (district: string) => void;

  // bổ sung API hiển thị
  onlyDistrict?: string;            // nếu truyền → chỉ render quận này
  showTabs?: boolean;               // ẩn/hiện tabs
  variant?: "grid" | "scroll";      // "scroll" = 1 hàng cuộn ngang
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
  const districts = useMemo(() => {
    const uniq = Array.from(new Set(data.map((x) => x.district)));
    if (!districtsOrder?.length) return uniq;
    const inOrder = districtsOrder.filter((d) => uniq.includes(d));
    const rest = uniq.filter((d) => !inOrder.includes(d));
    return [...inOrder, ...rest];
  }, [data, districtsOrder]);

  const [active, setActive] = useState<string>(
    onlyDistrict ?? districts[0] ?? ""
  );

  // nếu onlyDistrict thay đổi hoặc data đổi → cập nhật active tương ứng
  useEffect(() => {
    if (onlyDistrict && active !== onlyDistrict) setActive(onlyDistrict);
  }, [onlyDistrict]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!onlyDistrict && districts.length && !districts.includes(active)) {
      setActive(districts[0]);
    }
  }, [districts, onlyDistrict, active]);

  const filtered = useMemo(
    () => data.filter((x) => x.district === active),
    [data, active]
  );

  return (
    <section className="w-full rounded-3xl bg-emerald-900 px-4 py-6 sm:px-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="text-center text-white">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-white/80 text-sm md:text-base">{subtitle}</p>
        )}
      </div>

      {/* Tabs (ẩn khi onlyDistrict hoặc showTabs=false) */}
      {!onlyDistrict && showTabs && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {districts.map((d) => (
            <button
              key={d}
              onClick={() => setActive(d)}
              className={clsx(
                "px-3 py-1.5 rounded-full text-sm font-medium border",
                active === d
                  ? "bg-white text-emerald-700 border-white"
                  : "bg-emerald-800 text-white border-white/20 hover:bg-emerald-700"
              )}
            >
              {d}
            </button>
          ))}
          {!!active && (
            <button
              onClick={() => onSeeAll?.(active)}
              className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm border border-white/20 hover:bg-white/15"
            >
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Cards */}
      {variant === "grid" ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((item) => (
            <RoomCardItem
              key={item.id}
              item={item}
              onToggleFav={onToggleFav}
              onBook={onBook}
            />
          ))}
        </div>
      ) : (
        // --- SCROLL: dùng flex + item width cố định để thấy nhiều card cùng lúc ---
        <div className="mt-6 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
          <div className="flex gap-4 md:gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="min-w-[240px] sm:min-w-[260px] md:min-w-[280px]"
              >
                <RoomCardItem
                  item={item}
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
