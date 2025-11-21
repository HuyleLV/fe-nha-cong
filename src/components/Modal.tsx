"use client";

import React from "react";

export default function Modal({ open, title, onClose, children, footer }: {
  open: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-5xl mx-4 max-h-[92vh]">
        <div className="rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between bg-slate-100">
            <div className="text-lg font-semibold text-slate-800">{title}</div>
            <button onClick={onClose} aria-label="Close" className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
          </div>
          <div className="p-6 overflow-auto">{children}</div>
          {footer && <div className="px-6 py-3 bg-slate-100">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
