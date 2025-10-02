// app/blog/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Home, ChevronRight } from "lucide-react";
import { Blog } from "@/type/blog";
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
      <div className="mx-auto max-w-screen-xl px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 text-sm text-emerald-700/80">
          <Home className="h-4 w-4" />
          <span>Trang chủ</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-emerald-800">Blog</span>
        </div>
      </div>

      {/* -------- Featured + side list -------- */}
      <div className="mx-auto max-w-screen-xl px-4 pt-6">

        <h2 className="mb-6 text-3xl font-bold text-emerald-900">Bài viết nổi bật</h2>
        {loading ? (
          <SkeletonGrid />
        ) : err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            Không tải được dữ liệu: {err}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              {featured ? (
                <ArticleCardLarge
                  title={featured.title}
                  slug={featured.slug}
                  excerpt={featured.excerpt}
                  cover={featured.coverImageUrl}
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
                    slug={featured.slug}
                    excerpt={p.excerpt}
                    cover={p.coverImageUrl}
                  />
                ))
              ) : (
                // Nếu limit=1 hoặc không có side -> dựng khung để chờ đổ data khi tăng limit
                <>
                  <SkeletonSmall />
                  <SkeletonSmall />
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mx-auto max-w-screen-xl px-4 py-10">
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ArticleRowWide key={i} />
            ))}
          </div>
        ) : err ? null : unpinned.length > 0 ? (
          <>
            <h2 className="mb-6 text-3xl font-bold text-emerald-900">Bài viết khác</h2>
            <div className="space-y-6">
              {unpinned.map((p) => (
                <ArticleRowWide
                  key={p.id}
                  title={p.title}
                  slug={p.slug}
                  excerpt={p.excerpt}
                  cover={p.coverImageUrl}
                  date={p.createdAt}
                />
              ))}
            </div>
      
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              onPrev={handlePrev}
              onNext={handleNext}
            />
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