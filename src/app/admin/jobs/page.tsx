"use client";
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, RotateCcw, Edit, Trash2, Eye } from 'lucide-react';
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';
import { jobService } from '@/services/jobService';
import { Job } from '@/type/job';

function AdminJobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<Job[]>([]);
  const [meta, setMeta] = React.useState<{ total: number; page: number; limit: number; totalPages: number }>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [page, setPage] = React.useState<number>(Number(searchParams.get('page') || 1));
  const limit = 20;
  const [q, setQ] = React.useState<string>(searchParams.get('q') || '');

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobService.adminList({ page, limit, q });
      setItems(res.items);
      setMeta(res.meta);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = meta.totalPages || Math.max(1, Math.ceil(meta.total / limit));

  const goto = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/admin/jobs?${params.toString()}`);
    setPage(p);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('page', '1');
    router.push(`/admin/jobs?${params.toString()}`);
    setPage(1);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xoá tin tuyển dụng này?')) return;
    try {
      await jobService.remove(id);
      fetchData();
    } catch (e) {
      alert('Không thể xoá');
    }
  };

  return (
  <div className="mx-auto max-w-screen-2xl p-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-emerald-900">QUẢN LÝ TUYỂN DỤNG</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData()}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded border text-sm text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="size-4" /> Tải lại
          </button>
          <Link
            href="/admin/jobs/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
          >
            <Plus className="size-4" /> Thêm tin
          </Link>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={onSearch} className="my-4 flex flex-col sm:flex-row gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tiêu đề"
          className="border rounded px-3 py-2 flex-1"
        />
        <button className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">Lọc</button>
      </form>

      {/* Table */}
      <AdminTable headers={['ID','Tiêu đề','Trạng thái','Đăng','Thao tác']} loading={loading} emptyText="Không có tin tuyển dụng">
        {items.map(j => {
          const color = j.status === 'published' ? 'bg-green-100 text-green-700' : j.status === 'draft' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700';
          return (
            <tr key={j.id} className="hover:bg-slate-50 transition-colors text-sm">
              <td className="px-4 py-3">{j.id}</td>
              <td className="px-4 py-3 align-top">
                <div className="font-medium line-clamp-1" title={j.title}>{j.title}</div>
                <div className="text-xs text-gray-500">/{j.slug}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>
                  {j.status === 'published' ? 'Công khai' : j.status === 'draft' ? 'Nháp' : 'Lưu trữ'}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">{j.publishedAt ? new Date(j.publishedAt).toLocaleDateString() : '—'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link href={`/admin/jobs/${j.id}`} className="inline-flex items-center gap-1 px-3 py-1 text-[13px] rounded bg-yellow-500 text-white hover:bg-yellow-600"> <Edit size={14}/> Sửa</Link>
                  <button onClick={() => handleDelete(j.id)} className="inline-flex items-center gap-1 px-3 py-1 text-[13px] rounded bg-red-600 text-white hover:bg-red-700">
                    <Trash2 size={14}/> Xoá
                  </button>
                  <Link href={`/tuyen-dung/${j.slug || j.id}`} className="inline-flex items-center gap-1 px-3 py-1 text-[13px] rounded border border-slate-300 text-slate-700 hover:bg-slate-100">
                    <Eye size={14}/> Xem
                  </Link>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p)=>goto(p)}
          onPrev={()=> page>1 && goto(page-1)}
          onNext={()=> page<totalPages && goto(page+1)}
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Đang tải…</div>}>
      <AdminJobsPage />
    </Suspense>
  );
}
