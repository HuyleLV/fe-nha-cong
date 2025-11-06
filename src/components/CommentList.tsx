"use client";

import React, { useEffect, useState } from "react";
import { commentService, CommentItem } from "@/services/commentService";
import { timeAgo } from "@/utils/timeAgo";

export default function CommentList({ targetType, targetId }: { targetType: string; targetId: string | number }) {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 6;
  const [total, setTotal] = useState(0);

  const fetch = async (p = page) => {
    try {
      setLoading(true);
      setErr(null);
      const res = await commentService.list(targetType, targetId, p, limit);
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (e: any) {
      // Show a friendly message but do not log errors to console as per requirement
      setErr(e?.message || "Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await fetch(1); // reset to first page when target changes
      setPage(1);
    })();

    const onChanged = () => {
      // New comment likely belongs to page 1 (newest first) — jump to page 1
      setPage(1);
      fetch(1);
    };
    window.addEventListener("comments:changed", onChanged as EventListener);
    return () => { mounted = false; window.removeEventListener("comments:changed", onChanged as EventListener); };
  }, [targetType, targetId]);

  // refetch when page changes
  useEffect(() => {
    fetch(page);
  }, [page]);

  if (loading) return (
    <div className="py-4 text-center text-sm text-emerald-700">Đang tải bình luận...</div>
  );
  if (err) return (
    <div className="py-4 text-sm text-rose-600">{err}</div>
  );

  if (!items || items.length === 0) return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4 text-sm text-emerald-900">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</div>
  );

  return (
    <div className="space-y-3">
      {items.map((c) => (
        <div key={c.id} className="flex gap-3 rounded-lg border border-emerald-100 bg-white p-3 shadow-sm">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-emerald-50">
            {c.user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.user.avatarUrl} alt={c.user?.name || "avatar"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-emerald-700">{(c.user?.name || 'U').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}</div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-emerald-900">{c.user?.name ?? 'Người dùng'}</div>
                {c.user?.phoneVerified ? <span className="text-xs text-emerald-600 rounded-md bg-emerald-50 px-2 py-0.5">Đã xác thực</span> : null}
              </div>
              <div className="text-xs text-emerald-700/80">{timeAgo(c.createdAt)}</div>
            </div>
            <div className="mt-2 text-sm text-emerald-900 whitespace-pre-line">{c.content}</div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm text-emerald-700">Tổng {total} bình luận</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded px-3 py-1 text-sm border border-emerald-100 bg-white disabled:opacity-50">Trước</button>
          {/* simple page numbers, show up to 5 */}
          <div className="flex items-center gap-1">
            {(() => {
              const totalPages = Math.max(1, Math.ceil(total / limit));
              const pages: number[] = [];
              const start = Math.max(1, page - 2);
              const end = Math.min(totalPages, start + 4);
              for (let i = start; i <= end; i++) pages.push(i);
              return pages.map((pg) => (
                <button key={pg} onClick={() => setPage(pg)} className={"px-2 py-1 text-sm rounded " + (pg === page ? "bg-emerald-600 text-white" : "bg-white border border-emerald-100 text-emerald-800")}>{pg}</button>
              ));
            })()}
          </div>
          <button disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)} className="rounded px-3 py-1 text-sm border border-emerald-100 bg-white disabled:opacity-50">Sau</button>
        </div>
      </div>
    </div>
  );
}
 
