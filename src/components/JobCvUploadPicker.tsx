"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { UploadCloud, FileText, Trash2 } from "lucide-react";
import Spinner from "@/components/spinner";

type Props = {
  value?: string | null;
  onChange: (val: string | null) => void;
  disabled?: boolean;
};

export default function JobCvUploadPicker({ value, onChange, disabled }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  const ENDPOINT = `${API_BASE}/api/upload/file`;

  const pick = () => inputRef.current?.click();

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
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
      if (typeof data === "string") raw = data;
      else if (data?.path) raw = String(data.path);
      else if (data?.url) raw = String(data.url);

      if (!raw) {
        toast.error("Upload thành công nhưng không có đường dẫn.");
        return;
      }
      onChange(raw);
      toast.success("Đã upload CV!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Upload thất bại");
    } finally {
      setUploading(false);
      if (e.currentTarget) e.currentTarget.value = "";
    }
  };

  const remove = () => onChange(null);

  const displayUrl = value
    ? value.startsWith("http")
      ? value
      : `${API_BASE}/${value.replace(/^\/+/, "")}`
    : null;

  return (
    <div className="w-full">
      {!value ? (
        <button
          type="button"
          onClick={pick}
          disabled={uploading || disabled}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm"
        >
          <UploadCloud className="w-4 h-4" /> Tải CV (PDF/DOC/DOCX)
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
          <a
            href={displayUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-700 hover:underline"
          >
            <FileText className="w-4 h-4" /> Xem CV đã tải
          </a>
          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-1.5 text-red-600"
          >
            <Trash2 className="w-4 h-4" /> Xóa
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={onFileChange}
        disabled={uploading || disabled}
      />
      {uploading && (
        <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> <span>Đang tải…</span>
        </div>
      )}
    </div>
  );
}
