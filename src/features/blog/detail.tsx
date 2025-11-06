// app/blog/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Home, ChevronRight, Clock, Tag } from "lucide-react";
import ShareActions from "./share-actions";
import CommentList from "@/components/CommentList";
import CommentForm from "@/components/CommentForm";
import type { Metadata } from "next";
import { blogService } from "@/services/blogService";
import { timeAgo } from "@/utils/timeAgo";

export async function generateMetadata({
  slug
}: {
  slug: string;
}): Promise<Metadata> {
  try {
    const data = await blogService.getBySlug(slug);
    if (!data) return { title: "Bài viết không tồn tại" };

    return {
      title: data.title ?? slug,
      description: data.excerpt ?? `Bài viết: ${data.title}`,
      openGraph: {
        title: data.title ?? slug,
        description: data.excerpt ?? "",
        images: data.coverImageUrl ? [{ url: data.coverImageUrl }] : [],
        type: "article",
      },
      alternates: {
        canonical: `/blog/${slug}`,
      },
    };
  } catch {
    return { title: slug };
  }
}

export default async function BlogDetailPage({
  slug,
}: {
  slug: string;
}) {
  const post = await blogService.getBySlug(slug);
  if (!post) notFound();

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"}/blog/${slug}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-screen-2xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 text-sm text-emerald-700/80">
          <Link href="/" className="flex items-center gap-1 hover:text-emerald-900">
            <Home className="h-4 w-4" /> Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/blog" className="hover:text-emerald-900">
            Blog
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-emerald-900">Chi tiết</span>
        </div>
      </div>

      {/* Header + Title + Excerpt + Cover (CHUNG 1 CARD TRẮNG) */}
      <header className="max-w-screen-2xl mx-auto px-4 pb-2 pt-6">
        <section className="rounded-2xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
          {/* thanh gradient mảnh phía trên */}
          <div className="h-1 w-full bg-gradient-to-r from-[#006633] to-[#4CAF50]" />

          <div className="p-5 md:p-6">
            {/* top row: slug + meta */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-sm text-emerald-800/90">
                {post.createdAt && (
                  <span className="whitespace-nowrap">{timeAgo(post.createdAt)}</span>
                )}
                {/* {typeof post.minutes === "number" && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Clock className="h-4 w-4" />
                    {post.minutes} phút đọc
                  </span>
                )} */}
              </div>
            </div>

            {/* title + excerpt */}
            <h1 className="mt-3 text-3xl font-bold leading-tight text-emerald-950">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-2 text-base text-emerald-900/75">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* cover trong cùng card */}
          {post.coverImageUrl && (
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <div className="overflow-hidden rounded-xl">
                {/* Có thể đổi sang next/image khi đã config images.domains */}
                <img
                  src={process.env.NEXT_PUBLIC_API_URL + post.coverImageUrl}
                  alt={post.title}
                  className="h-[500px] w-full object-cover md:h-[500px]"
                />
              </div>
            </div>
          )}
        </section>
      </header>

      {/* Body (TRẮNG) + Sidebar */}
      <main className="max-w-screen-2xl mx-auto gap-6 px-4 py-8 md:grid md:grid-cols-[1fr_300px]">
        {/* Nội dung chính */}
        <article className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="html-render leading-7 text-emerald-900/95 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_p]:my-4">
            <div dangerouslySetInnerHTML={{ __html: post?.content ?? "" }} />
          </div>

          {/* Tags */}
          {post.tags?.length ? (
            <div className="mt-8 flex flex-wrap gap-3 border-t border-emerald-100 pt-5">
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={`/blog?tag=${encodeURIComponent(t)}`}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm text-emerald-800 hover:border-emerald-400"
                >
                  <Tag className="h-4 w-4" /> {t}
                </Link>
              ))}
            </div>
          ) : null}

          {/* Share */}
          <div className="mt-6">
            <ShareActions shareUrl={shareUrl} />
          </div>

          
        </article>

        {/* Sidebar */}
        <aside className="mt-6 md:mt-0">
          <div className="sticky top-24 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-emerald-900">Gợi ý</p>
            <ul className="space-y-2 text-sm text-emerald-800/90">
              <li className="rounded-md px-2 py-1 hover:bg-emerald-50">
                Bài viết mới nhất
              </li>
              <li className="rounded-md px-2 py-1 hover:bg-emerald-50">
                Chủ đề liên quan
              </li>
              <li className="rounded-md px-2 py-1 hover:bg-emerald-50">
                Từ khóa phổ biến
              </li>
            </ul>
          </div>
        </aside>

        {/* Comments */}
        <div>
          <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-emerald-900">Bình luận</h3>
            <CommentForm targetType="blog" targetId={post.slug} />
            <div className="mt-4">
              <CommentList targetType="blog" targetId={post.slug} />
            </div>
          </section>
        </div>
      </main>
      
    </div>
  );
}