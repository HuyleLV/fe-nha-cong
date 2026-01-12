"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { newsService } from "@/services/newsService";
import { usePathname } from "next/navigation";

export default function NewsDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await newsService.getBySlug(slug);
        if (!cancelled) setItem(data);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Không tìm thấy');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!item) return <div className="p-6">Không tìm thấy bài viết</div>;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
      {item.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.coverImageUrl} alt={item.title} className="w-full rounded-lg mb-6" />
      )}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: item.content || item.excerpt || '' }} />
    </div>
  );
}
