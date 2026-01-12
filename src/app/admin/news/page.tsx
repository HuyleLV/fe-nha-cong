"use client";
import { useEffect, useState, useMemo } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { newsService } from "@/services/newsService";
import { formatDateTime } from "@/utils/format-time";
import Spinner from "@/components/spinner";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { News, NewsStatus } from "@/type/news";
import Pagination from "@/components/Pagination";
import AdminTable from "@/components/AdminTable";
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminNewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0) / limit)), [total]);

  const fetch = async (p = page) => {
    setLoading(true);
    try {
      const { items: data, meta } = await newsService.getAll({ page: p, limit });
      setItems(data || []);
      setTotal(meta?.total ?? (data?.length || 0));
    } catch (err) {
      console.error(err);
      toast.error('Không tải được danh sách tin tức');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(page); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page]);

  const handlePrev = () => page > 1 && setPage((p) => p - 1);
  const handleNext = () => page < totalPages && setPage((p) => p + 1);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]"><Spinner /></div>
    );

  return (
    <div className="mx-auto max-w-screen-2xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">QUẢN LÝ TIN TỨC</h1>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => router.push('/admin/news/create')}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <AdminTable
        headers={["ID","Tiêu đề","Slug","Tags","SEO","Trạng thái","Views","Ngày tạo","Ngày cập nhật","Thao tác"]}
        loading={loading}
        emptyText="Chưa có tin tức nào."
      >
        {items.map((b) => (
          <tr key={b.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-2 font-medium text-gray-900">{b.id}</td>
            <td className="px-4 py-2">{b.title}</td>
            <td className="px-4 py-2 text-gray-700">{b.slug}</td>
            <td className="px-4 py-2 text-gray-700">{b.tags?.length ? b.tags.join(", ") : <span className="text-gray-400">—</span>}</td>
            <td className="px-4 py-2">{(b.pointSeo ?? 0)}/100</td>
            <td className="px-4 py-2">{b.status === NewsStatus.Published ? 'Công khai' : b.status === NewsStatus.Draft ? 'Bản nháp' : 'Lưu trữ'}</td>
            <td className="px-4 py-2">{b.viewCount ?? 0}</td>
            <td className="px-4 py-2 text-gray-500">{formatDateTime(b.createdAt)}</td>
            <td className="px-4 py-2 text-gray-500">{formatDateTime(b.updatedAt)}</td>
            <td className="px-4 py-2">
              <div className="flex justify-center gap-2">
                <button className="flex items-center gap-1 px-3 py-2 text-sm bg-yellow-500 text-white rounded-md" onClick={() => router.push(`/admin/news/${b.id}`)}>
                  <Edit size={15} />
                </button>
                <button className="flex items-center gap-1 px-3 py-2 text-sm bg-red-600 text-white rounded-md" onClick={() => { setTargetId(b.id); setConfirmOpen(true); }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <ConfirmModal
        open={confirmOpen}
        title="Xoá tin tức"
        message={`Bạn có chắc chắn muốn xoá tin #${targetId ?? ''}?`}
        onCancel={() => { setConfirmOpen(false); setTargetId(null); }}
        onConfirm={async () => {
          if (!targetId) return;
          try {
            await newsService.delete(targetId);
            toast.success('Xoá thành công');
            fetch(1);
            setPage(1);
          } catch (err) {
            console.error(err);
            toast.error('Xoá thất bại');
          } finally {
            setConfirmOpen(false); setTargetId(null);
          }
        }}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} onPrev={handlePrev} onNext={handleNext} />
    </div>
  );
}
