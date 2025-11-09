"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { jobService } from '@/services/jobService';
import { Job } from '@/type/job';

export default function AdminJobEditPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string;
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [job, setJob] = React.useState<Job | null>(null);

  const [form, setForm] = React.useState<any>({});

  React.useEffect(() => {
    (async () => {
      try {
        const data = await jobService.get(idParam);
        setJob(data);
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
            requirements: data.requirements || '',
            benefits: data.benefits || '',
            location: data.location || '',
            employmentType: data.employmentType || '',
            level: data.level || '',
            salaryMin: data.salaryMin ?? '',
            salaryMax: data.salaryMax ?? '',
            currency: data.currency || 'VND',
            status: data.status,
        });
      } catch (e) {
        alert('Không tìm thấy tin');
        router.replace('/admin/jobs');
      } finally {
        setLoading(false);
      }
    })();
  }, [idParam, router]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      };
      const updated = await jobService.update(job.id, payload);
      alert('Đã cập nhật');
      router.refresh();
      setJob(updated);
    } catch (e) {
      alert('Không thể cập nhật');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!job) return null;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Sửa tin tuyển dụng #{job.id}</h1>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Tiêu đề</label>
            <input value={form.title} onChange={(e)=>set('title', e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Slug</label>
            <input value={form.slug} onChange={(e)=>set('slug', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Địa điểm</label>
          <input value={form.location} onChange={(e)=>set('location', e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Hình thức</label>
          <input value={form.employmentType} onChange={(e)=>set('employmentType', e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Cấp bậc</label>
          <input value={form.level} onChange={(e)=>set('level', e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm mb-1">Lương tối thiểu</label>
            <input type="number" value={form.salaryMin} onChange={(e)=>set('salaryMin', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Lương tối đa</label>
            <input type="number" value={form.salaryMax} onChange={(e)=>set('salaryMax', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Tiền tệ</label>
            <input value={form.currency} onChange={(e)=>set('currency', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Mô tả</label>
          <textarea value={form.description} onChange={(e)=>set('description', e.target.value)} className="w-full border rounded px-3 py-2 min-h-[120px]" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Yêu cầu</label>
          <textarea value={form.requirements} onChange={(e)=>set('requirements', e.target.value)} className="w-full border rounded px-3 py-2 min-h-[120px]" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Quyền lợi</label>
          <textarea value={form.benefits} onChange={(e)=>set('benefits', e.target.value)} className="w-full border rounded px-3 py-2 min-h-[120px]" />
        </div>
        <div>
          <label className="block text-sm mb-1">Trạng thái</label>
          <select value={form.status} onChange={(e)=>set('status', e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="draft">Nháp</option>
            <option value="published">Công khai</option>
            <option value="archived">Lưu trữ</option>
          </select>
        </div>
        <div className="md:col-span-2 flex gap-2">
          <button disabled={submitting} className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50">{submitting ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded">Quay lại</button>
        </div>
      </form>
    </div>
  );
}
