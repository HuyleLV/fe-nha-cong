"use client";

import React from "react";

type AdminTableProps = {
  headers: React.ReactNode[];
  children: React.ReactNode; // rows
  emptyText?: string;
  loading?: boolean;
};

export default function AdminTable({ headers, children, emptyText = "Chưa có dữ liệu", loading }: AdminTableProps) {
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow">
      <div className="min-w-full">
        <table className="w-full text-left text-[15px]">
          <thead className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur text-slate-700">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-5 py-3.5 font-semibold uppercase tracking-wide text-[12px] border-b border-slate-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="py-7 text-center text-slate-500">Đang tải…</td>
              </tr>
            ) : React.Children.count(children) === 0 ? (
              <tr>
                <td colSpan={headers.length} className="py-7 text-center text-slate-500">{emptyText}</td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
