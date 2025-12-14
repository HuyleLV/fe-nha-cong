// components/RoomCardItem.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, MapPin, BedDouble, Bath, Sofa, Tag, Check } from "lucide-react";
import clsx from "clsx";
import { toast } from "react-toastify";
import { formatMoneyVND } from "@/utils/format-number";
import { Apartment } from "@/type/apartment";
import { favoriteService } from "@/services/favoriteService";

type Props = {
  item: Apartment & { favorited?: boolean }; // hỗ trợ BE trả thêm cờ favorited
  isFav?: boolean;                            // hoặc truyền từ cha
  onToggleFav?: (id: Apartment["id"]) => void;
  onBook?: (apt: Apartment) => void;
  /** Badge tuỳ chọn hiển thị trên góc ảnh (ví dụ: thời điểm đã xem) */
  extraBadge?: React.ReactNode;
};

const withBase = (u?: string | null) => {
  if (!u) return undefined; // ⬅️ trả undefined thay vì ""
  if (u.startsWith("http") || u.startsWith("data:")) return u;
  return `${process.env.NEXT_PUBLIC_API_URL || ""}${u}`;
};

const toNumber = (v?: string | null) => {
  if (!v) return 0;
  const n = parseFloat(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export default function RoomCardItem({ item, isFav, onToggleFav, onBook, extraBadge }: Props) {
  const router = useRouter();

  // Determine current viewer role (best-effort). If admin token present, show everything.
  const isAdminViewer = typeof window !== "undefined" && !!localStorage.getItem("tokenAdmin");

  // Helper to normalize room status
  const roomStatusKey = (a: any): 'sap_trong' | 'o_ngay' | 'het_phong' => {
    const raw = a?.roomStatus ?? a?.room_status ?? a?.occupancyStatus ?? a?.availability ?? null;
    if (!raw) return 'o_ngay';
    const s = String(raw).toLowerCase();
    if (s === 'sap_trong' || s.includes('sap') || s.includes('sắp') || s.includes('coming')) return 'sap_trong';
    if (s === 'o_ngay' || s.includes('o_ngay') || s.includes('ở') || s.includes('available') || s.includes('vacant')) return 'o_ngay';
    if (s === 'het_phong' || s.includes('het') || s.includes('hết') || s.includes('full') || s.includes('occupied')) return 'het_phong';
    return 'o_ngay';
  };

  // If viewer is not admin, hide apartments that aren't approved or are fully occupied
  if (!isAdminViewer) {
    const approvedFlag = (item as any).isApproved ?? (item as any).is_approved;
    const approved = Boolean(approvedFlag);
    const statusKey = roomStatusKey(item);
    if (!approved || statusKey === 'het_phong') return null;
  }

  // ===== Local state cho tim (được hydrate từ prop/BE/API) =====
  const [fav, setFav] = useState<boolean>(!!(isFav ?? item.favorited));
  const [loadingFav, setLoadingFav] = useState(false);

  // Sync nếu prop isFav thay đổi từ cha
  useEffect(() => {
    if (typeof isFav === "boolean") setFav(isFav);
  }, [isFav]);

  // Hydrate lần đầu từ item.favorited (BE) nếu chưa có prop
  useEffect(() => {
    if (typeof isFav !== "boolean" && typeof item.favorited === "boolean") {
      setFav(item.favorited);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.favorited]);

  // Cuối cùng: nếu vẫn chưa xác định, tự gọi API kiểm tra (đảm bảo F5 không mất tim)
  useEffect(() => {
    if (typeof isFav === "boolean" || typeof item.favorited === "boolean") return;

    const hasToken =
      typeof window !== "undefined" &&
      (localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token") ||
        localStorage.getItem("tokenAdmin") ||
        localStorage.getItem("tokenUser") ||
        document.cookie.includes("access_token="));

    if (!hasToken) return;

    let mounted = true;
    favoriteService
      .isFavorited(item.id)
      .then((res) => {
        if (mounted && typeof res?.favorited === "boolean") setFav(res.favorited);
      })
      .catch(() => {/* im lặng */});
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  // Lắng nghe thay đổi global để sync (khi user toggle ở nơi khác)
  useEffect(() => {
    const onFavChanged = () => {
      const hasToken =
        typeof window !== "undefined" &&
        (localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token") ||
          localStorage.getItem("tokenAdmin") ||
          localStorage.getItem("tokenUser") ||
          document.cookie.includes("access_token="));
      if (!hasToken) return;

      favoriteService
        .isFavorited(item.id)
        .then((res) => typeof res?.favorited === "boolean" && setFav(res.favorited))
        .catch(() => {});
    };
    window.addEventListener("fav:changed", onFavChanged as EventListener);
    return () => window.removeEventListener("fav:changed", onFavChanged as EventListener);
  }, [item.id]);

  // Giá/diện tích/ảnh/địa chỉ
  const price = toNumber(item.rentPrice);
  const discountPercent = typeof (item as any).discountPercent === 'number' ? (item as any).discountPercent : 0;
  const discountAmountRaw = (item as any).discountAmount ? toNumber((item as any).discountAmount) : 0;
  // Tính giá sau ưu đãi: ưu tiên phần trăm nếu >0, nếu không dùng số tiền. Nếu cả hai >0: lấy mức giảm lớn hơn.
  const discountFromPercent = discountPercent > 0 ? Math.round(price * discountPercent / 100) : 0;
  const chosenDiscount = Math.max(discountFromPercent, discountAmountRaw);
  const finalPrice = chosenDiscount > 0 ? Math.max(0, price - chosenDiscount) : price;
  const isPercentDominant = chosenDiscount === discountFromPercent && discountFromPercent > 0;
  const area = item.areaM2 ? toNumber(item.areaM2) : undefined;
  const beds = item.bedrooms;
  const baths = item.bathrooms;
  const livingRooms = item.livingRooms;

  // ⬇️ Lấy ảnh đầu tiên an toàn (undefined nếu rỗng)
  const imageUrl = useMemo(() => {
    const first = item.coverImageUrl || item.images?.[0] || undefined;
    return withBase(first);
  }, [item.coverImageUrl, item.images]);
  const address = item.streetAddress || "";
  const detailHref = item.slug ? `/room/${item.slug}` : "#";

  const requireAuth = () => {
    const token =
      typeof window !== "undefined" &&
      (localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token") ||
        localStorage.getItem("tokenAdmin") ||
        localStorage.getItem("tokenUser") ||
        document.cookie.includes("access_token="));
    return !!token;
  };

  const handleToggleFavorite = async () => {
    if (loadingFav) return;
    if (!requireAuth()) {
      toast.info("Vui lòng đăng nhập để sử dụng tính năng yêu thích.");
  router.push("/dang-nhap");
      return;
    }

    // Nếu caller muốn tự quản lý danh sách → chỉ gọi callback
    if (onToggleFav) {
      onToggleFav(item.id);
      return;
    }

    // Tự quản lý: optimistic UI + gọi API add/remove
    try {
      setLoadingFav(true);
      const next = !fav;
      setFav(next); // optimistic

      if (next) {
        await favoriteService.addFavorite({ apartmentId: item.id });
        toast.success("Đã thêm vào yêu thích ❤️");
      } else {
        await favoriteService.removeFavorite(item.id);
        toast.info("Đã bỏ khỏi yêu thích 💔");
      }

      // cho các nơi khác sync
      window.dispatchEvent(new CustomEvent("fav:changed"));
    } catch (err: any) {
      setFav((v) => !v); // rollback
      toast.error(err?.message || "Không thể cập nhật yêu thích");
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <article className="group h-full flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Ảnh (click mở chi tiết) */}
      <div className="relative">
        <Link href={detailHref} aria-label={`Xem chi tiết ${item.title}`}>
          {/* ⬇️ KHÔNG render <img> khi không có URL để tránh src="" */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="aspect-[4/3] h-auto w-full object-cover"
              onError={(e) => {
                const t = e.currentTarget as HTMLImageElement;
                t.onerror = null; // prevent loop
                t.src = "/logo.png";
              }}
            />
          ) : (
            <div className="aspect-[4/3] bg-gray-100 grid place-items-center text-gray-400 text-sm">
              Không có ảnh
            </div>
          )}
        </Link>

        {/* Overlay clusters (ưu đãi + extra badge) */}
        {(chosenDiscount > 0 || extraBadge || item.isVerified) && (
          <div className="absolute left-3 top-3 z-20 flex flex-col gap-2">
            {chosenDiscount > 0 && (
              <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 px-2 py-1 text-[11px] font-semibold text-white shadow ring-1 ring-white/40">
                <Tag className="w-3 h-3" />
                {isPercentDominant
                  ? `-${discountPercent}%`
                  : `-${formatMoneyVND(chosenDiscount).replace(/\s*₫/, '').replace(/\s+/g,'')}đ`}
              </div>
            )}
            {item.isVerified && (
              <span
                title="Nhà đã xác thực"
                aria-label="Nhà đã xác thực"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2 py-1 text-[11px] font-semibold text-white shadow ring-1 ring-white/40"
              >
                <Check className="w-3.5 h-3.5" /> <span>Xác thực</span>
              </span>
            )}
            {extraBadge && (
              <div className="inline-flex max-w-[180px] items-center gap-1 rounded-full bg-gradient-to-r from-white/95 to-white/70 px-2 py-1 text-[11px] font-medium text-slate-700 shadow backdrop-blur-md ring-1 ring-white/50">
                {extraBadge}
              </div>
            )}
          </div>
        )}
        <div className="absolute right-2 top-2 z-20 inline-flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite();
            }}
            disabled={loadingFav}
            className={clsx(
              "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md cursor-pointer",
              "hover:bg-white shadow disabled:opacity-60"
            )}
            aria-label={fav ? "Bỏ yêu thích" : "Thêm yêu thích"}
            title={fav ? "Bỏ yêu thích" : "Thêm yêu thích"}
          >
            <Heart
              className={clsx(
                "h-5 w-5 transition-colors",
                fav ? "fill-rose-500 text-rose-500" : "text-emerald-700"
              )}
            />
          </button>
        </div>
      </div>

      {/* Nội dung */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="line-clamp-2 font-semibold text-slate-800 mb-1">
          <Link href={detailHref} className="hover:underline">
            {item.title}
          </Link>
        </h3>

        <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{address}</span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          {typeof area === "number" && area > 0 && <span>{area} m²</span>}
          {typeof beds === "number" && beds >= 0 && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {beds}
            </span>
          )}
          {typeof baths === "number" && baths >= 0 && (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-4 w-4" /> {baths}
            </span>
          )}
          {typeof livingRooms === "number" && livingRooms >= 0 && (
            <span className="inline-flex items-center gap-1">
              <Sofa className="h-4 w-4" /> {livingRooms}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex flex-col">
            {chosenDiscount > 0 ? (
              <>
                <div className="text-xs line-through text-slate-400">{formatMoneyVND(price)}</div>
                <div className="font-extrabold text-emerald-700">{formatMoneyVND(finalPrice)}</div>
              </>
            ) : (
              <div className="font-extrabold text-emerald-700">{formatMoneyVND(price)}</div>
            )}
          </div>
          <Link
            href={detailHref}
            aria-label={`Xem chi tiết ${item.title}`}
            className="rounded-full border border-emerald-600 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            prefetch={false}
          >
            ĐẶT PHÒNG
          </Link>
        </div>
      </div>
    </article>
  );
}
