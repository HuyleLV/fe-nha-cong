"use client";

import React, { ReactNode } from "react";
import Link from "next/link";

type StatCardProps = {
  title: string;
  value: string | number;
  sub?: string;
  color?: keyof typeof COLORS;
  icon?: ReactNode;
  href?: string; 
};

const COLORS = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  sky: { bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
  lime: { bg: "bg-lime-50", text: "text-lime-700", ring: "ring-lime-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", ring: "ring-indigo-200" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-700", ring: "ring-cyan-200" },
  slate: { bg: "bg-slate-50", text: "text-slate-700", ring: "ring-slate-200" },
};

export default function StatCard({ title, value, sub, color = "emerald", icon, href }: StatCardProps) {
  const c = COLORS[color] ?? COLORS.emerald;
  const content = (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-md p-6 h-full">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text-slate-700">{title}</div>
        {icon && (
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${c.bg} ${c.text} ring-2 ${c.ring} text-2xl`}>{icon}</div>
        )}
      </div>
      <div className="mt-3 text-3xl md:text-4xl font-bold text-slate-900">{value}</div>
      {sub && <div className="mt-1 text-sm text-slate-500">{sub}</div>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full hover:shadow-lg transition-shadow rounded-2xl">
        {content}
      </Link>
    );
  }
  return content;
}
