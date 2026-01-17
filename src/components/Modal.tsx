"use client";

import React from "react";

export default function Modal({ open, title, onClose, children, footer, maxWidthClass }: {
  open: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  // Tailwind max-width class, e.g. 'max-w-2xl', 'max-w-md'
  maxWidthClass?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-full ${maxWidthClass ?? 'max-w-5xl'} mx-4 max-h-[92vh]`}>
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[92vh] flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</div>
            <button onClick={onClose} aria-label="Close" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
          </div>
          <div className="p-6 overflow-auto text-slate-700 dark:text-slate-300">{children}</div>
          {footer && <div className="px-6 py-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
