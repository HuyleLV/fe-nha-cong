"use client";

import { useEffect, useState } from "react";
import { newsService } from "@/services/newsService";
import { News } from "@/type/news";
import ArticleCardLarge from "@/components/ArticleCardLarge";
import ArticleCardSmall from "@/components/ArticleCardSmall";
import Pagination from "@/components/Pagination";

export default function NewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { items: data, meta } = await newsService.getAll({ page, limit: 8 });
        if (!cancelled) {
          setItems(data || []);
          setTotalPages(meta?.totalPages || 1);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Lỗi tải tin tức");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 pt-6 pb-2">
        <h1 className="text-3xl font-bold text-emerald-900">Tin tức & Sự kiện</h1>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 py-6">
        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : err ? (
          <div className="text-red-600">{err}</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              {items[0] && (
                <ArticleCardLarge
                  title={items[0].title}
                  slug={items[0].slug}
                  excerpt={items[0].excerpt}
                  cover={items[0].coverImageUrl}
                  date={items[0].createdAt}
                />
              )}
              {items.slice(1).map((it) => (
                <ArticleCardSmall
                  key={it.id}
                  title={it.title}
                  slug={it.slug}
                  excerpt={it.excerpt}
                  cover={it.coverImageUrl}
                  date={it.createdAt}
                />
              ))}
            </div>

            <div>
              {/* simple sidebar placeholder */}
              <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                <h3 className="text-lg font-semibold">Bài viết nổi bật</h3>
                <div className="mt-4 space-y-3">
                  {items.slice(0, 4).map((it) => (
                    <a key={it.id} href={`/news/${it.slug}`} className="block text-slate-800 hover:text-emerald-700">{it.title}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      </div>
    </div>
  );
}
