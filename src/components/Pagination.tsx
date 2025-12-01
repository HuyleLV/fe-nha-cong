"use client";

import React from "react";

// Support two common prop shapes found across the codebase so the component
// can be used uniformly:
// - New style: { page, limit, total, onPageChange }
// - Old style: { page, totalPages, onPageChange, onPrev, onNext }
type NewProps = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
};

type OldProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
};

type Props = NewProps | OldProps;

function isNewProps(p: Props): p is NewProps {
  return (p as NewProps).limit !== undefined && (p as NewProps).total !== undefined;
}

export default function Pagination(props: Props) {
  const siblingCount = isNewProps(props) ? (props.siblingCount ?? 3) : 3;

  // normalize to pageCount and simple handlers so both shapes render the same UI
  // Coerce page to a number to avoid "1" vs 1 mismatches when callers
  // pass a string (common when reading from query params). This ensures
  // the active-button comparison (p === page) reliably matches and the
  // active background (green) is applied consistently.
  const page = Number((props as any).page) || 1;
  const pageCount = isNewProps(props)
    ? Math.max(1, Math.ceil(((props as NewProps).total || 0) / ((props as NewProps).limit || 1)))
    : Math.max(1, (props as OldProps).totalPages || 1);

  const onPageChange = (p: number) => {
    if (p === page) return;
    if (isNewProps(props)) props.onPageChange(p);
    else props.onPageChange(p);
  };

  const onPrev = () => {
    const next = Math.max(1, page - 1);
    if (isNewProps(props)) props.onPageChange(next);
    else if (props.onPrev) props.onPrev(); else props.onPageChange(next);
  };

  const onNext = () => {
    const next = Math.min(pageCount, page + 1);
    if (isNewProps(props)) props.onPageChange(next);
    else if (props.onNext) props.onNext(); else props.onPageChange(next);
  };

  // Always render pagination per user request (even for a single page)
  const pages: number[] = [];
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || Math.abs(i - page) <= siblingCount) pages.push(i);
  }

  return (
    <nav className="mt-4 flex items-center justify-center gap-4" aria-label="Pagination">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-shadow border ${page <= 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-slate-700 hover:shadow-sm border-gray-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) => (
            <React.Fragment key={p}>
              {idx > 0 && pages[idx - 1] + 1 < p && (
                <span className="px-2 text-sm text-gray-400 select-none">…</span>
              )}
              <button
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`min-w-[36px] h-9 flex items-center justify-center px-3 rounded-full text-sm font-medium transition-colors border ${p === page ? 'bg-emerald-600 text-white border-emerald-600 shadow' : 'bg-white text-slate-700 border-gray-200 hover:bg-slate-50'}`}
              >
                {p}
              </button>
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={page >= pageCount}
          aria-label="Next page"
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-shadow border ${page >= pageCount ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-slate-700 hover:shadow-sm border-gray-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
}