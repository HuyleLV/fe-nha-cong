"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import JobApplyForm from "@/components/JobApplyForm";
import { X } from "lucide-react";

export default function JobApplyModal({ jobIdOrSlug }: { jobIdOrSlug: number | string }) {
  const [open, setOpen] = useState(false);
  const canPortal = typeof window !== "undefined" && typeof document !== "undefined";

  // Optional: lock body scroll when modal opens
  useEffect(() => {
    if (!canPortal) return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open, canPortal]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Ứng tuyển ngay
      </button>

      {open && canPortal &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <div className="relative z-[210] w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold">Ứng tuyển vào vị trí này</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-slate-100"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <JobApplyForm jobIdOrSlug={jobIdOrSlug} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
