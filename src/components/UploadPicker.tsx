"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { UploadCloud, Maximize2, Trash2, ImageIcon, RefreshCcw } from "lucide-react";
import Spinner from "@/components/spinner";

type Props = {
  // single path or array of paths. Keep backward compatibility by accepting both.
  value?: string | string[] | null; // ví dụ: "/uploads/abc.jpg" or ["/uploads/a.jpg", "/uploads/b.jpg"]
  onChange: (val: string | string[] | null) => void;
  // allow multiple images (grid mode). Default false for backward compatibility.
  multiple?: boolean;
  // maximum items when multiple=true
  max?: number;
  uploadUrl?: string;
  aspectClass?: string;
  disabled?: boolean;
};

export default function UploadPicker({
  value,
  onChange,
  uploadUrl,
  aspectClass = "aspect-[16/9]",
  multiple = false,
  max = 9,
  disabled,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "https://api.nhacong.com.vn";
  const ENDPOINT = uploadUrl || `${API_BASE}/api/upload/image`;

  const pickFile = () => inputRef.current?.click();

  const getCurrentValues = (): string[] => {
    if (!value) return [];
    return Array.isArray(value) ? value.slice() : [value];
  };

  const isMultiMode = Boolean(multiple) || Array.isArray(value);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const existing = getCurrentValues();
    const maxCount = max ?? 9;
    if (existing.length >= maxCount) {
      toast.error(`Tối đa ${maxCount} ảnh`);
      if (e.currentTarget) e.currentTarget.value = '';
      return;
    }
    // If single mode, upload only the first file and return a single string
    if (!isMultiMode) {
      const file = files[0];
      try {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        const res = await axios.post(ENDPOINT, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        const data = res.data as any;
        let raw: string | undefined;
        if (typeof data === 'string') raw = data;
        else if (data?.path) raw = String(data.path);
        else if (data?.url) raw = String(data.url);
        if (!raw) {
          toast.error('Upload thành công nhưng không có đường dẫn.');
        } else {
          onChange(raw);
          toast.success('Đã upload ảnh!');
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || 'Upload thất bại');
      } finally {
        setUploading(false);
        if (e.currentTarget) e.currentTarget.value = '';
      }
      return;
    }

    // Multi mode: Trim files to fit max
    const allowed = files.slice(0, Math.max(0, maxCount - existing.length));

    try {
      setUploading(true);
      const uploadedPaths: string[] = [];
      for (const file of allowed) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await axios.post(ENDPOINT, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        const data = res.data as any;
        let raw: string | undefined;
        if (typeof data === 'string') raw = data;
        else if (data?.path) raw = String(data.path);
        else if (data?.url) raw = String(data.url);
        if (!raw) {
          toast.error('Upload thành công nhưng không có đường dẫn.');
          continue;
        }
        uploadedPaths.push(raw);
      }

      const next = existing.concat(uploadedPaths).slice(0, maxCount);
      onChange(next);
      if (uploadedPaths.length) toast.success('Đã upload ảnh!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
      if (e.currentTarget) e.currentTarget.value = '';
    }
  };

  const handleRemove = (index?: number) => {
    if (index == null) {
      onChange(null);
      toast.info('Đã xóa ảnh.');
      return;
    }
    const arr = getCurrentValues();
    arr.splice(index, 1);
    onChange(arr.length === 0 ? null : arr);
    toast.info('Đã xóa ảnh.');
  };

  const currentValues = getCurrentValues();
  const displayUrls = currentValues.map((v) =>
    v && v.startsWith('http') ? v : `${API_BASE}/${String(v || '').replace(/^\/+/, '')}`,
  );

  return (
    <div className="space-y-3">
      {/* Single or Multi mode rendering */}
      <div>
        {isMultiMode ? (
          currentValues.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {displayUrls.map((src, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={(ev) => {
                        dragIndexRef.current = i;
                        try { ev.dataTransfer?.setData('text/plain', String(i)); } catch {}
                      }}
                      onDragOver={(ev) => {
                        ev.preventDefault();
                      }}
                      onDrop={(ev) => {
                        ev.preventDefault();
                        const from = dragIndexRef.current ?? parseInt(ev.dataTransfer?.getData('text/plain') || "" , 10);
                        const to = i;
                        if (Number.isFinite(from) && from >= 0 && from !== to) {
                          const arr = getCurrentValues();
                          const item = arr.splice(from, 1)[0];
                          arr.splice(to, 0, item);
                          onChange(arr.length === 0 ? null : arr);
                        }
                        dragIndexRef.current = null;
                      }}
                      className="relative rounded-lg overflow-hidden border border-slate-200 bg-white"
                    >
                      <img src={src} alt={`img-${i}`} className={`w-full h-28 object-cover cursor-pointer`} onClick={() => { setPreviewIndex(i); setPreviewOpen(true); }} />
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button type="button" title="Lên" onClick={() => { if (i <= 0) return; const arr = getCurrentValues(); const tmp = arr[i-1]; arr[i-1] = arr[i]; arr[i] = tmp; onChange(arr); }} className="bg-white/90 p-1 rounded shadow text-xs">↑</button>
                    <button type="button" title="Xuống" onClick={() => { if (i >= currentValues.length -1) return; const arr = getCurrentValues(); const tmp = arr[i+1]; arr[i+1] = arr[i]; arr[i] = tmp; onChange(arr); }} className="bg-white/90 p-1 rounded shadow text-xs">↓</button>
                    <button type="button" title="Xóa" onClick={() => handleRemove(i)} className="bg-white/90 p-1 rounded shadow text-xs text-red-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
              {currentValues.length < (max ?? 9) && (
                <label className={`flex items-center justify-center border-2 border-dashed rounded-lg p-2 text-slate-500 cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                  <div className="text-center">
                    <UploadCloud className="mx-auto w-6 h-6 mb-1" />
                    <div className="text-sm">Thêm ảnh</div>
                    <div className="text-xs text-slate-400">({currentValues.length}/{max ?? 9})</div>
                  </div>
                  <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading || disabled} multiple />
                </label>
              )}
            </div>
          ) : (
            <div className="w-full rounded-lg border-2 border-dashed border-slate-200 p-6 text-slate-500 text-center">
              <ImageIcon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm mb-2">Chưa có ảnh</p>
              <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                <UploadCloud className="w-4 h-4" /> Chọn ảnh từ máy
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading || disabled} multiple />
              </label>
              {uploading && (
                <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                  <Spinner /> <span>Đang tải…</span>
                </div>
              )}
            </div>
          )
        ) : (
          // single mode UI (large aspect preview)
          currentValues.length > 0 ? (
            <div className={`relative w-full ${aspectClass} overflow-hidden rounded-lg border border-slate-200`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrls[0] || ''}
                alt="preview"
                className="w-full h-full object-cover"
                onClick={() => { setPreviewIndex(0); setPreviewOpen(true); }}
              />

              <div className="absolute bottom-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setPreviewIndex(0); setPreviewOpen(true); }}
                  className="px-2 py-1 rounded bg-white/90 border border-slate-200 text-sm"
                >
                  <Maximize2 className="w-4 h-4" /> Xem
                </button>
                <label
                  className={`px-2 py-1 rounded bg-white/90 border border-slate-200 text-sm cursor-pointer ${
                    uploading ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  <RefreshCcw className="w-4 h-4" /> Đổi
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading || disabled}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemove(0)}
                  className="px-2 py-1 rounded bg-white/90 border border-slate-200 text-red-600 text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Xóa
                </button>
              </div>

              {uploading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <Spinner /> <span className="ml-2 text-sm">Đang tải…</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full rounded-lg border-2 border-dashed border-slate-200 p-6 text-slate-500 text-center">
              <ImageIcon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm mb-2">Chưa có ảnh</p>
              <label
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer ${
                  uploading ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <UploadCloud className="w-4 h-4" /> Chọn ảnh từ máy
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading || disabled}
                />
              </label>
              {uploading && (
                <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                  <Spinner /> <span>Đang tải…</span>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {previewOpen && displayUrls[previewIndex] && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={displayUrls[previewIndex]} alt={`full-${previewIndex}`} className="w-full h-auto rounded-lg" />
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}