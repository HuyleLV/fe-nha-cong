"use client";

import React, { ReactNode } from "react";

type PanelProps = {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export default function Panel({ title, icon, actions, children, className }: PanelProps) {
  return (
    <div className={"rounded-2xl bg-white dark:bg-slate-800 px-6 py-4 border border-slate-100 dark:border-slate-700 shadow-sm " + (className ?? "")}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {icon && <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-2xl">{icon}</span>}
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        </div>
        {actions}
      </div>
      <div className="mt-2 text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </div>
  );
}
