"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { jobApplicationService } from '@/services/jobApplicationService';
import Spinner from '@/components/spinner';
import JobCvUploadPicker from '@/components/JobCvUploadPicker';

export default function JobApplyForm({ jobIdOrSlug, onSuccess }: { jobIdOrSlug: number | string, onSuccess?: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/,'');
  const uploadEndpoint = `${API_BASE}/api/upload/image`; // TEMP: reuse image endpoint for PDFs is not allowed; keep as optional screenshot or skip

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Vui lòng nhập họ tên'); return; }
    try {
      setSubmitting(true);
      await jobApplicationService.apply(jobIdOrSlug, { name: name.trim(), email: email || undefined, phone: phone || undefined, cvUrl: cvUrl || undefined, message: message || undefined });
      // Hiển thị toast ngắn gọn và chuyển sang màn hình cảm ơn dạng popup cha
      toast.success('Ứng tuyển thành công!');
      setName(''); setEmail(''); setPhone(''); setCvUrl(null); setMessage('');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Gửi ứng tuyển thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div>
        <label className="text-sm text-slate-600">Họ tên</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Nguyễn Văn A" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm text-slate-600">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="email@domain.com" />
        </div>
        <div>
          <label className="text-sm text-slate-600">Số điện thoại</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="09xx xxx xxx" />
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-600">Lời nhắn</label>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Giới thiệu ngắn, vị trí ứng tuyển..." />
      </div>
      <div>
        <label className="text-sm text-slate-600 mb-1 block">CV của bạn</label>
        <JobCvUploadPicker value={cvUrl} onChange={setCvUrl} />
        <p className="mt-1 text-[12px] text-slate-500">Chỉ nhận PDF, DOC, DOCX. Tối đa 5MB.</p>
      </div>
      <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
        {submitting ? 'Đang gửi...' : 'Ứng tuyển ngay'}
      </button>
    </form>
  );
}
