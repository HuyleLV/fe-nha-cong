// components/RoomCardItem.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, MapPin, BedDouble, Bath, CheckCircle2 } from "lucide-react";
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

export default function RoomCardItem({ item, isFav, onToggleFav, onBook }: Props) {
  const router = useRouter();

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
  const area = item.areaM2 ? toNumber(item.areaM2) : undefined;
  const beds = item.bedrooms;
  const baths = item.bathrooms;

  // ⬇️ Lấy ảnh đầu tiên an toàn (undefined nếu rỗng)
  const imageUrl = useMemo(() => {
    const first = item.coverImageUrl || item.images?.[0] || undefined;
    return withBase(first);
  }, [item.coverImageUrl, item.images]);
  console.log(item)
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
            />
          ) : (
            <div className="aspect-[4/3] bg-gray-100 grid place-items-center text-gray-400 text-sm">
              Không có ảnh
            </div>
          )}
        </Link>

        {/* Verified badge over image (top-left) */}
        {item.isVerified && (
          <span
            title="Đã xác minh"
            className="absolute left-3 top-3 inline-flex items-center justify-center rounded-full bg-white/90 p-1 shadow-lg"
            style={{ zIndex: 20 }}
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite();
          }}
          disabled={loadingFav}
          className={clsx(
            "absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md cursor-pointer",
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

      {/* Nội dung */}
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <h3 className="line-clamp-2 min-h-[3.25rem] font-semibold text-slate-800">
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
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="font-extrabold text-emerald-700">
            {formatMoneyVND(toNumber(item.rentPrice))}
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
