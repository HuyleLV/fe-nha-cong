"use client";
import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { blogService } from "@/services/blogService";
import { formatDateTime } from "@/utils/format-time";
import Spinner from "@/components/spinner";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Blog, BlogStatus } from "@/type/blog";
import Pagination from "@/components/Pagination";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const limit = 6;

  const fetchBlogs = async () => {
    try {
      const { items, meta } = await blogService.getAll();
      setBlogs(items || []);
      setTotal(meta.total);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
      toast.error("Không tải được danh sách blog");
    } finally {
      setLoading(false);
    }
  };
    
  const totalPages = Math.ceil(total / limit);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const statusText = (s: BlogStatus) =>
    s === BlogStatus.Published ? "Published" : s === BlogStatus.Draft ? "Draft" : "Archived";

  const statusClass = (s: BlogStatus) =>
    s === BlogStatus.Published
      ? "text-green-600"
      : s === BlogStatus.Draft
      ? "text-yellow-600"
      : "text-gray-500";

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">QUẢN LÝ BLOG</h1>

      <div className="flex justify-end mb-2">
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
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Views</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3">Ngày cập nhật</th>
            <th className="px-4 py-3 text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-[15px]">
          {blogs.map((b) => (
            <tr key={b.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2 font-medium text-gray-900">{b.id}</td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {/* nếu muốn hiện ảnh cover nhỏ: */}
                  {/* {b.coverImageUrl && (
                    <img src={b.coverImageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                  )} */}
                  <span className="line-clamp-1">{b.title}</span>
                </div>
              </td>
              <td className="px-4 py-2 text-gray-700">{b.slug}</td>
              <td className="px-4 py-2 text-gray-700">
                {b.tags?.length ? b.tags.join(", ") : <span className="text-gray-400">—</span>}
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
                        fetchBlogs();
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
          ))}

          {!blogs.length && (
            <tr>
              <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
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
