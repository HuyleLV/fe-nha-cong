"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import JobApplyForm from "@/components/JobApplyForm";
import { X } from "lucide-react";

export default function JobApplyModal({ jobIdOrSlug }: { jobIdOrSlug: number | string }) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
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
        onClick={() => { setOpen(true); setSuccess(false); }}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Ứng tuyển ngay
      </button>

      {open && canPortal &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <div className="relative z-[210] w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              {!success && (
                <>
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
                    <JobApplyForm jobIdOrSlug={jobIdOrSlug} onSuccess={() => setSuccess(true)} />
                  </div>
                </>
              )}
              {success && (
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <X className="hidden" />
                    <svg className="h-10 w-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Ứng tuyển thành công</h3>
                  <div className="space-y-3 text-sm text-slate-600 max-h-[50vh] overflow-y-auto pr-1">
                    <p>Cảm ơn bạn đã gửi hồ sơ ứng tuyển cho vị trí tại Nha Công. Chúng tôi trân trọng thời gian và sự quan tâm của bạn.</p>
                    <p>Hồ sơ của bạn đã được ghi nhận vào hệ thống. Đội ngũ tuyển dụng sẽ xem xét và liên hệ nếu hồ sơ phù hợp với yêu cầu vị trí.</p>
                    <p>Trong thời gian chờ phản hồi, bạn có thể khám phá thêm các vị trí khác hoặc cập nhật thông tin cá nhân để tăng khả năng phù hợp.</p>
                    <p>Chúc bạn một ngày làm việc hiệu quả và nhiều năng lượng tích cực!</p>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
                    <button onClick={() => { setOpen(false); setSuccess(false); }} className="flex-1 rounded-lg bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700">Đóng</button>
                    {/* <button onClick={() => setSuccess(false)} className="flex-1 rounded-lg bg-slate-200 text-slate-700 px-4 py-2 hover:bg-slate-300">Ứng tuyển tiếp</button> */}
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
