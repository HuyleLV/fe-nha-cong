"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { UploadCloud, Maximize2, Trash2, PlaySquare, RefreshCcw } from "lucide-react";
import Spinner from "@/components/spinner";

type Props = {
  value?: string | null;            // e.g., "/uploads/videos/abc.mp4" or public path
  onChange: (val: string | null) => void;
  uploadUrl?: string;
  aspectClass?: string;
  disabled?: boolean;
  maxMB?: number; // client-side max size, default 25MB (matches backend)
};

export default function VideoUploadPicker({
  value,
  onChange,
  uploadUrl,
  aspectClass = "aspect-video",
  disabled,
  maxMB = 25,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";
  const ENDPOINT = uploadUrl || `${API_BASE}/api/upload/video`;

  const pickFile = () => inputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size guard
    const maxBytes = maxMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`Video quá nặng. Tối đa ${maxMB}MB.`);
      e.currentTarget.value = "";
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post(ENDPOINT, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data as any;
      let raw: string | undefined;

      if (typeof data === "string") raw = data;
      else if (data?.path) raw = String(data.path);
      else if (data?.url) raw = String(data.url);

      if (!raw) {
        toast.error("Upload thành công nhưng không có đường dẫn video.");
        return;
      }

      onChange(raw);
      toast.success("Đã upload video!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Upload thất bại");
    } finally {
      setUploading(false);
      if (e.currentTarget) e.currentTarget.value = "";
    }
  };

  const handleRemove = () => {
    onChange(null);
    toast.info("Đã xoá video.");
  };

  const displayUrl = value
    ? value.startsWith("http")
      ? value
      : `${API_BASE}/${value.replace(/^\/+/, "")}`
    : null;

  return (
    <div className="space-y-3">
      {value ? (
        <div className={`relative w-full ${aspectClass} overflow-hidden rounded-lg border border-slate-200 bg-black`}>
          {displayUrl ? (
            <video
              src={displayUrl}
              controls
              className="w-full h-full object-contain bg-black"
              onClick={() => setPreviewOpen(true)}
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-slate-500 bg-slate-50">
              <PlaySquare className="w-8 h-8" />
            </div>
          )}

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
                accept="video/*"
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
              <Trash2 className="w-4 h-4" /> Xoá
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
          <PlaySquare className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm mb-2">Chưa có video</p>
          <label
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer ${
              uploading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <UploadCloud className="w-4 h-4" /> Chọn video từ máy (≤ {maxMB}MB)
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
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
            <video src={displayUrl} controls className="w-full h-auto rounded-lg bg-black" />
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
