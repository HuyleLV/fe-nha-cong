"use client";
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, RotateCcw, Edit, Trash2, Eye, Users, Clipboard } from 'lucide-react';
import AdminTable from '@/components/AdminTable';
import Pagination from '@/components/Pagination';
import { jobService } from '@/services/jobService';
import { jobApplicationService } from '@/services/jobApplicationService';
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

  const [counts, setCounts] = React.useState<Record<number,{ total:number; byStatus: Record<string, number> }>>({});

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobService.adminList({ page, limit, q });
      setItems(res.items);
      setMeta(res.meta);
      // Fetch application counts in parallel
      if (res.items.length) {
        try {
          const c = await jobApplicationService.adminCounts(res.items.map(i=>i.id));
          setCounts(c);
        } catch (err) { /* silent */ }
      } else {
        setCounts({});
      }
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
            <Plus className="size-4" />
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
      <AdminTable headers={['ID','Ảnh','Tiêu đề','Ứng tuyển','Trạng thái','Đăng','Thao tác']} loading={loading} emptyText="Không có tin tuyển dụng">
        {items.map(j => {
          const color = j.status === 'published' ? 'bg-green-100 text-green-700' : j.status === 'draft' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700';
          const c = counts[j.id];
          const newCount = c?.byStatus?.new || 0;
          const totalCount = c?.total || 0;
          return (
            <tr key={j.id} className="hover:bg-slate-50 transition-colors text-sm">
              <td className="px-4 py-3">{j.id}</td>
              <td className="px-4 py-3">
                {j.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(process.env.NEXT_PUBLIC_API_URL || '') + j.coverImageUrl}
                    alt="cover"
                    className="h-12 w-20 object-cover rounded-md border border-slate-200"
                  />
                ) : (
                  <div className="h-12 w-20 flex items-center justify-center rounded-md border border-dashed border-slate-200 text-[10px] text-slate-400">—</div>
                )}
              </td>
              <td className="px-4 py-3 align-top">
                <div className="font-medium line-clamp-1" title={j.title}>{j.title}</div>
                <div className="text-[11px] text-gray-500">/{j.slug}</div>
              </td>
              <td className="px-4 py-3 text-xs">
                {totalCount ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-slate-100 text-slate-700">
                      <Users size={12}/> {totalCount}
                    </span>
                    {newCount > 0 && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-amber-500 text-white text-[11px]">Mới {newCount}</span>
                    )}
                  </div>
                ) : <span className="text-slate-400">—</span>}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>
                  {j.status === 'published' ? 'Công khai' : j.status === 'draft' ? 'Nháp' : 'Lưu trữ'}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">{j.publishedAt ? new Date(j.publishedAt).toLocaleDateString() : '—'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2 flex-wrap">
                  <Link href={`/admin/jobs/${j.id}/ung-tuyen`} title="Danh sách ứng tuyển" className="inline-flex items-center gap-1.5 h-8 px-3 text-sm rounded-md bg-emerald-500 text-white hover:bg-emerald-600">
                    <Clipboard size={14}/>
                  </Link>
                  <Link href={`/admin/jobs/${j.id}`} title="Chỉnh sửa" className="inline-flex items-center gap-1.5 h-8 px-3 text-sm rounded-md bg-amber-500 text-white hover:bg-amber-600"> <Edit size={14}/></Link>
                  <button onClick={() => handleDelete(j.id)} title="Xoá" className="inline-flex items-center gap-1.5 h-8 px-3 text-sm rounded-md bg-rose-600 text-white hover:bg-rose-700 cursor-pointer">
                    <Trash2 size={14}/> 
                  </button>
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
