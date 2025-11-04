// app/blog/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Home, ChevronRight } from "lucide-react";
import adBanner from "@/assets/banner-01.jpg";
import { Blog } from "@/type/blog";
import { Location, LocationLevel } from "@/type/location";
import { locationService } from "@/services/locationService";
import { blogService } from "@/services/blogService";
import ArticleCardLarge from "@/components/ArticleCardLarge";
import ArticleCardSmall from "@/components/ArticleCardSmall";
import ArticleRowWide from "@/components/ArticleRowWide";
import Pagination from "@/components/Pagination";

export default function BlogPage() {
  // Search UI
  const [q, setQ] = useState("");

  // API states
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState(6);

  // Top areas (popular/trending districts)
  const [topAreas, setTopAreas] = useState<Location[]>([]);
  const [locLoading, setLocLoading] = useState(true);
  const [locErr, setLocErr] = useState<string | null>(null);
  const levelLabel: Record<LocationLevel, string> = {
    Province: "Tỉnh/Thành",
    City: "Thành phố",
    District: "Quận/Huyện",
  };
  
    
  const totalPages = Math.ceil(total / limit);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        const { items, meta } = await blogService.getAll({ page, limit });
        if (!cancelled) {
          setBlogs(items ?? [])
          setTotal(meta?.total);
        };
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Fetch failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, limit]);

  // Load popular locations (proxy: districts list)
  useEffect(() => {
    let cancelled = false;
    async function loadAreas() {
      try {
        setLocLoading(true);
        setLocErr(null);
        const res = await locationService.getAll({ page: 1, limit: 6, level: "District" as LocationLevel });
        if (!cancelled) setTopAreas(res.items || []);
      } catch (e: any) {
        if (!cancelled) setLocErr(e?.message || "Fetch locations failed");
      } finally {
        if (!cancelled) setLocLoading(false);
      }
    }
    loadAreas();
    return () => { cancelled = true };
  }, []);

  // Search theo tiêu đề (nếu API có title)
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return blogs.filter((b) => (b?.title ?? "").toLowerCase().includes(kw));
  }, [blogs, q]);

  // Featured + side
  const featured = filtered[0] || blogs[0];
  const side = filtered
    .slice(1, 5)
    .filter((b) => b?.isPinned == true) 
    .filter((b) => b?.status == 1);

  const unpinned = filtered
    .filter((b) => b?.isPinned == false) 
    .filter((b) => b?.status == 1) 

  return (
    <div className="min-h-screen bg-white">
      {/* -------- Breadcrumb + search -------- */}
      <div className="mx-auto max-w-screen-2xl px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 text-sm text-emerald-700/80">
          <Home className="h-4 w-4" />
          <span>Trang chủ</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-emerald-800">Blog</span>
        </div>
      </div>

      {/* -------- Featured + side list -------- */}
      <div className="mx-auto max-w-screen-2xl px-4 pt-6">

        <h2 className="mb-6 text-3xl font-bold text-emerald-900">Bài viết nổi bật</h2>
        {loading ? (
          <SkeletonGrid />
        ) : err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            Không tải được dữ liệu: {err}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              {featured ? (
                <ArticleCardLarge
                  title={featured.title}
                  slug={featured.slug}
                  excerpt={featured.excerpt}
                  cover={featured.coverImageUrl}
                  date={featured.createdAt}
                />
              ) : (
                <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-emerald-700 shadow-sm">
                  Chưa có bài viết.
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {side.length > 0 ? (
                side.map((p) => (
                  <ArticleCardSmall
                    key={p.id}
                    title={p.title}
                    slug={p.slug}
                    excerpt={p.excerpt}
                    cover={p.coverImageUrl}
                    date={p.createdAt}
                  />
                ))
              ) : (
                <>
                  <SkeletonSmall />
                  <SkeletonSmall />
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* -------- Ad banner dưới khu vực nổi bật -------- */}
      <div className="mx-auto max-w-screen-2xl px-4 mt-6">
        <a
          href="#"
          aria-label="Quảng cáo"
          className="block overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm"
        >
          <div
            className="relative w-full"
            style={{ aspectRatio: `${adBanner.width}/${adBanner.height}` }}
          >
            <img
              src={adBanner.src}
              alt="Quảng cáo"
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        </a>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <ArticleRowWide key={i} />
              ))}
            </div>
            <div className="space-y-3">
              <SidebarAreasSkeleton />
            </div>
          </div>
        ) : err ? null : unpinned.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Left 2/3: Title + Newest post */}
              <div className="md:col-span-2">
                <h2 className="mb-6 text-3xl font-bold text-emerald-900">Bài viết mới nhất</h2>
                <ArticleRowWide
                  title={unpinned[0]?.title}
                  slug={unpinned[0]?.slug}
                  excerpt={unpinned[0]?.excerpt}
                  cover={unpinned[0]?.coverImageUrl}
                  date={unpinned[0]?.createdAt}
                />
              </div>

              {/* Right 1/3: Hot areas aligned with the title */}
              <div>
                <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-emerald-900">
                      Khu vực trọ thu hút nhất
                    </h3>
                    <a
                      href="/tim-phong-quanh-day"
                      className="text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      Xem tất cả
                    </a>
                  </div>
                  {locLoading ? (
                    <SidebarAreasSkeleton />
                  ) : locErr ? (
                    <div className="text-sm text-red-600">{locErr}</div>
                  ) : topAreas.length > 0 ? (
                    <ul className="space-y-2">
                      {topAreas.map((l, i) => (
                        <li key={l.id} className="group">
                          <a
                            href={`/tim-phong-quanh-day?locationSlug=${encodeURIComponent(l.slug || String(l.id))}`}
                            className="flex items-center gap-4 rounded-xl border border-transparent p-2 transition hover:border-emerald-200 hover:bg-emerald-50"
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                              {i + 1}
                            </div>
                            <div className="h-20 w-20 overflow-hidden rounded-lg bg-emerald-50 ring-1 ring-emerald-100">
                              {l.coverImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={(process.env.NEXT_PUBLIC_API_URL || "") + l.coverImageUrl}
                                  alt={l.name || "Khu vực"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full animate-pulse bg-emerald-100" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-emerald-900 group-hover:text-emerald-800">{l.name || "Khu vực"}</p>
                              <p className="text-xs text-emerald-800/70">{levelLabel[l.level] ?? l.level}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-emerald-700/60 group-hover:text-emerald-800/80" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-emerald-700">Chưa có dữ liệu khu vực</div>
                  )}
                </div>
              </div>

              {/* Pagination centered under the left two columns */}
              <div className="md:col-span-2 flex justify-center">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(newPage) => setPage(newPage)}
                  onPrev={handlePrev}
                  onNext={handleNext}
                />
              </div>
            </div>

          </>
        ) : (
          <div className="rounded-xl border border-emerald-100 bg-white p-4 text-emerald-700 shadow-sm">
            Chưa có bài viết không ghim.
          </div>
        )}
      </div>

    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="aspect-[16/9] w-full animate-pulse bg-emerald-100" />
          <div className="space-y-3 p-6">
            <div className="h-6 w-2/3 animate-pulse rounded bg-emerald-100" />
            <div className="h-4 w-full animate-pulse rounded bg-emerald-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-emerald-100" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <SkeletonSmall />
        <SkeletonSmall />
      </div>
    </div>
  );
}

function SkeletonSmall() {
  return (
    <div className="grid grid-cols-3 gap-4 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
      <div className="h-28 w-full animate-pulse rounded-xl bg-emerald-100" />
      <div className="col-span-2 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-emerald-100" />
        <div className="h-3 w-full animate-pulse rounded bg-emerald-100" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-emerald-100" />
      </div>
    </div>
  );
}

function SidebarAreasSkeleton() {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="mb-4 h-6 w-2/3 animate-pulse rounded bg-emerald-100" />
      <ul className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-lg bg-emerald-100" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-emerald-100" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-emerald-100" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}