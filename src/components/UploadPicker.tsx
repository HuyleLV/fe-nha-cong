"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { UploadCloud, Maximize2, Trash2, ImageIcon, RefreshCcw } from "lucide-react";
import Spinner from "@/components/spinner";

type Props = {
  value?: string | null;            // ví dụ: "/uploads/abc.jpg"
  onChange: (val: string | null) => void;
  uploadUrl?: string;
  aspectClass?: string;
  disabled?: boolean;
};

export default function UploadPicker({
  value,
  onChange,
  uploadUrl,
  aspectClass = "aspect-[16/9]",
  disabled,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";
  const ENDPOINT = uploadUrl || `${API_BASE}/api/upload/image`;

  const pickFile = () => inputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post(ENDPOINT, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data as any;
      let raw: string | undefined;

      // server có thể trả { path }, { url }, hoặc string
      if (typeof data === "string") raw = data;
      else if (data?.path) raw = String(data.path);
      else if (data?.url) raw = String(data.url);

      if (!raw) {
        toast.error("Upload thành công nhưng không có đường dẫn.");
        return;
      }

      onChange(raw); // ⬅️ chỉ lưu raw path
      toast.success("Đã upload ảnh!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Upload thất bại");
    } finally {
      setUploading(false);
      if (e.currentTarget) e.currentTarget.value = "";
    }
  };

  const handleRemove = () => {
    onChange(null);
    toast.info("Đã xóa ảnh.");
  };

  const displayUrl = value
    ? value.startsWith("http")
      ? value
      : `${API_BASE}/${value.replace(/^\/+/, "")}` // render preview
    : null;

  return (
    <div className="space-y-3">
      {value ? (
        <div className={`relative w-full ${aspectClass} overflow-hidden rounded-lg border border-slate-200`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl || ""}
            alt="preview"
            className="w-full h-full object-cover"
            onClick={() => setPreviewOpen(true)}
          />

          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="px-2 py-1 rounded bg-white/90 border border-slate-200 text-sm"
            >
              <Maximize2 className="w-4 h-4" /> Xem
            </button>
            <label
              className={`px-2 py-1 rounded bg-white/90 border border-slate-200 text-sm cursor-pointer ${
                uploading ? "opacity-60 pointer-events-none" : ""
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
              onClick={handleRemove}
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
              uploading ? "opacity-60 pointer-events-none" : ""
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
      )}

      {previewOpen && displayUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={displayUrl} alt="full" className="w-full h-auto rounded-lg" />
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