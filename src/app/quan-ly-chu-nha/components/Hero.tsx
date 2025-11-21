"use client";

import React, { ReactNode } from "react";

type HeroProps = {
  areaLabel?: string;
  title: string;
  subtitle?: string;
  leftIcon?: ReactNode;
  actions?: ReactNode;
};

export default function DashboardHero({ areaLabel, title, subtitle, leftIcon, actions }: HeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-5 py-6">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {areaLabel && (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-inset ring-white/40">
              {leftIcon}
              <span>{areaLabel}</span>
            </div>
          )}
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-white/90">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {/* subtle decorations */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
}
