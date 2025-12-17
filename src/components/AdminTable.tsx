"use client";

import React from "react";

type AdminTableProps = {
  headers: React.ReactNode[];
  children: React.ReactNode; // rows
  emptyText?: string;
  loading?: boolean;
};

export default function AdminTable({ headers, children, emptyText = "Chưa có dữ liệu", loading }: AdminTableProps) {
  // merge existing row className with our hover style
  const enhanceRows = (nodes: React.ReactNode) => {
    return React.Children.map(nodes, (child) => {
      if (!React.isValidElement(child)) return child;
      const el = child as React.ReactElement<any>;
      const existing = (el.props && (el.props.className as string)) || '';
      const merged = [existing, 'hover:bg-slate-50 transition-colors'].filter(Boolean).join(' ');
      return React.cloneElement(el, { className: merged });
    });
  };

  return (
    <div className="mt-5 overflow-x-auto rounded bg-white shadow">
      <div className="min-w-full">
  <table className={`w-full text-[15px] table-auto border-collapse [&_th]:border [&_th]:border-slate-200 [&_td]:border [&_td]:border-slate-200 [&_th]:bg-slate-100 [&_th]:text-center [&_td]:!text-center [&_td>img]:mx-auto [&_td>button]:mx-auto [&_td>a]:mx-auto [&_td>div]:mx-auto`}>
          <thead className="sticky top-0 z-10">
            <tr>
              {headers.map((h, i) => {
                return (
                  <th
                    key={i}
                    className={`px-4 py-3 font-semibold uppercase tracking-wide text-[12px] text-center`}
                  >
                    {h}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="py-7 text-center text-slate-500">Đang tải…</td>
              </tr>
            ) : React.Children.count(children) === 0 ? (
              <tr>
                <td colSpan={headers.length} className="py-7 text-center text-slate-500">{emptyText}</td>
              </tr>
            ) : (
              enhanceRows(children)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
