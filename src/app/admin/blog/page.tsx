"use client";
import { useEffect, useState, useMemo } from "react";
import { Edit, Trash2 } from "lucide-react";
import { blogService } from "@/services/blogService";
import { formatDateTime } from "@/utils/format-time";
import Spinner from "@/components/spinner";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Blog, BlogStatus } from "@/type/blog";
import Pagination from "@/components/Pagination";
import { toSlug } from "@/utils/formatSlug";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const limit = 6;

  const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0) / limit)), [total]);

  const seoBadgeClass = (n?: number) =>
    (n ?? 0) >= 80
      ? "bg-emerald-100 text-emerald-700"
      : (n ?? 0) >= 50
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";

  const seoBarClass = (n?: number) =>
    (n ?? 0) >= 80 ? "bg-emerald-500" : (n ?? 0) >= 50 ? "bg-amber-500" : "bg-rose-500";

  const statusText = (s: BlogStatus) =>
    s === BlogStatus.Published ? "Published" : s === BlogStatus.Draft ? "Draft" : "Archived";

  const statusClass = (s: BlogStatus) =>
    s === BlogStatus.Published
      ? "text-green-600"
      : s === BlogStatus.Draft
      ? "text-yellow-600"
      : "text-gray-500";

  const fallbackKeyword = (b: Blog) => {
    // ưu tiên field focusKeyword từ API, sau đó lấy tag đầu, sau đó gợi ý 3 từ đầu của title
    const fromApi = (b as any)?.focusKeyword as string | undefined;
    if (fromApi && fromApi.trim()) return fromApi.trim();
    if (b.tags?.length) return b.tags[0];
    return (b.title || "").split(" ").slice(0, 3).join(" ");
  };

  const fetchBlogs = async (p = page) => {
    setLoading(true);
    try {
      // NOTE: cần blogService.getAll hỗ trợ query { page, limit }
      const { items, meta } = await blogService.getAll({ page: p, limit });
      setBlogs(items || []);
      setTotal(meta?.total ?? items?.length ?? 0);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
      toast.error("Không tải được danh sách blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handlePrev = () => page > 1 && setPage((p) => p - 1);
  const handleNext = () => page < totalPages && setPage((p) => p + 1);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">QUẢN LÝ BLOG</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 cursor-pointer"
          onClick={() => router.push("/admin/blog/create")}
        >
          + Tạo bài viết
        </button>
      </div>

      <table className="w-full text-left border border-gray-200 shadow rounded-lg overflow-hidden mt-5">
        <thead className="bg-gray-200 text-gray-700 uppercase text-[14px]">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Tiêu đề</th>
            <th className="px-4 py-3">Slug</th>
            <th className="px-4 py-3">Tags</th>
            <th className="px-4 py-3">Keyword</th>
            <th className="px-4 py-3">SEO</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Views</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3">Ngày cập nhật</th>
            <th className="px-4 py-3 text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-[15px]">
          {blogs.map((b) => {
            const pointSeo = (b as any)?.pointSeo as number | undefined; // NEW
            const kw = fallbackKeyword(b); // NEW

            return (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2 font-medium text-gray-900">{b.id}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {/* Nếu muốn hiện cover nhỏ:
                    {b.coverImageUrl && (
                      <img src={b.coverImageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                    )} */}
                    <span className="line-clamp-1">{b.title}</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-gray-700">{b.slug}</td>
                <td className="px-4 py-2 text-gray-700">
                  {b.tags?.length ? b.tags.join(", ") : <span className="text-gray-400">—</span>}
                </td>

                {/* KEYWORD */}
                <td className="px-4 py-2">
                  <span className="inline-flex max-w-[180px] items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs truncate">
                    {kw || "—"}
                  </span>
                </td>

                {/* SEO SCORE */}
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${seoBadgeClass(pointSeo)}`}>
                      {Number.isFinite(pointSeo) ? `${pointSeo}` : "0"}/100
                    </span>
                    <div className="w-20 h-2 bg-gray-200 rounded overflow-hidden">
                      <div
                        className={`h-2 ${seoBarClass(pointSeo)}`}
                        style={{ width: `${Math.max(0, Math.min(100, pointSeo ?? 0))}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className={`px-4 py-2 font-semibold ${statusClass(b.status)}`}>
                  {statusText(b.status)} {b.isPinned ? "• Pinned" : ""}
                </td>
                <td className="px-4 py-2">{b.viewCount ?? 0}</td>
                <td className="px-4 py-2 text-gray-500">{formatDateTime(b.createdAt)}</td>
                <td className="px-4 py-2 text-gray-500">{formatDateTime(b.updatedAt)}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-center gap-2">
                    <button
                      className="flex items-center gap-1 px-4 py-1 text-[15px] bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition cursor-pointer"
                      onClick={() => router.push(`/admin/blog/${b.id}`)}
                    >
                      <Edit size={15} />
                      Sửa
                    </button>
                    <button
                      className="flex items-center gap-1 px-4 py-1 text-[15px] bg-red-600 text-white rounded-md hover:bg-red-700 transition cursor-pointer"
                      onClick={async () => {
                        const ok = confirm("Bạn có chắc chắn muốn xoá bài viết này?");
                        if (!ok) return;
                        try {
                          await blogService.delete(b.id);
                          toast.success("Xoá bài viết thành công!");
                          fetchBlogs(1); // về trang 1 nếu xóa để tránh trang rỗng
                          setPage(1);
                        } catch (err) {
                          console.error(err);
                          toast.error("Xoá thất bại, vui lòng thử lại!");
                        }
                      }}
                    >
                      <Trash2 size={15} />
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {!blogs.length && (
            <tr>
              <td colSpan={11} className="px-4 py-6 text-center text-gray-500">
                Chưa có bài viết nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
