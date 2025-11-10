"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "react-toastify";

type ShareCopyButtonProps = {
  className?: string;
  url?: string;              // override URL nếu muốn copy URL khác
  label?: string;            // tuỳ chỉnh text hiển thị
  variant?: "outline" | "solid";
  size?: "sm" | "md";
  afterCopyLabel?: string;   // text sau khi copy (mặc định: Đã sao chép)
  resetDelayMs?: number;     // thời gian reset trạng thái copied
};

export default function ShareCopyButton({
  className = "",
  url,
  label = "Chia sẻ",
  variant = "outline",
  size = "md",
  afterCopyLabel = "Đã sao chép",
  resetDelayMs = 1800,
}: ShareCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const doCopy = async (text: string) => {
    // Thử navigator.clipboard, fallback textarea nếu không hỗ trợ
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  const onClick = async () => {
    try {
      const target = url || window.location.href;
      await doCopy(target);
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelayMs);
      try { toast.success("Đã sao chép liên kết"); } catch {}
    } catch (e) {
      try { toast.error("Sao chép thất bại"); } catch {}
    }
  };

  const base = "inline-flex items-center justify-center gap-1.5 rounded transition select-none focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const variantCls = variant === "solid"
    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
    : "border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white";
  const sizeCls = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm";
  const stateCls = copied ? (variant === "solid" ? "bg-emerald-700" : "bg-emerald-50 border-emerald-300 text-emerald-700") : "";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Sao chép liên kết chia sẻ"
      className={[base, variantCls, sizeCls, stateCls, "w-full", className].filter(Boolean).join(" ")}
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />} {copied ? afterCopyLabel : label}
      <span className="sr-only" aria-live="polite">{copied ? "Đã sao chép" : "Chia sẻ"}</span>
    </button>
  );
}
