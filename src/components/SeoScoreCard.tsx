// components/SeoScoreCard.tsx
'use client';

import { CheckCircle2, CircleAlert } from 'lucide-react';
import { useSeoScore } from '@/hooks/useSeoScore';
import { SeoScoreResult } from '@/type/seo';

type Props = {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  cover?: string | null;
  tags?: string[];
  focusKeyword: string;
  onChangeFocusKeyword?: (v: string) => void;
  inputClassName?: string;
};

export default function SeoScoreCard({
  title,
  slug,
  excerpt,
  contentHtml,
  cover,
  tags,
  focusKeyword,
  onChangeFocusKeyword,
  inputClassName = "w-full rounded border border-dashed border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
}: Props) {

  const res: SeoScoreResult = useSeoScore({
    title, slug, excerpt, contentHtml, cover, tags, focusKeyword
  });

  const badgeClasses =
    res.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
    res.score >= 50 ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700';

  const barClasses =
    res.score >= 80 ? 'bg-emerald-500' :
    res.score >= 50 ? 'bg-amber-500' :
                      'bg-rose-500';

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center gap-3">
        <input
          className={inputClassName}
          placeholder="Từ khóa trọng tâm (ví dụ: phòng trọ Hà Đông)"
          value={focusKeyword}
          onChange={(e) => onChangeFocusKeyword?.(e.target.value)}
        />
        <div className="min-w-[120px] text-center">
          <div className={`mx-auto h-8 rounded-full px-3 inline-flex items-center justify-center text-sm font-semibold ${badgeClasses}`}>
            SEO: {res.score}/100
          </div>
        </div>
      </div>

      {/* progress */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-2 ${barClasses}`} style={{ width: `${res.score}%` }} />
      </div>

      {/* overview */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg border p-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{res.good.length} tốt</span>
        </div>
        <div className="rounded-lg border p-2 flex items-center gap-2">
          <CircleAlert className="w-4 h-4 text-amber-500" />
          <span>{res.warn.length} nên cải thiện</span>
        </div>
        <div className="rounded-lg border p-2 flex items-center gap-2">
          <CircleAlert className="w-4 h-4 text-rose-500" />
          <span>{res.bad.length} thiếu</span>
        </div>
      </div>

      {/* lists */}
      <div className="space-y-3">
        {res.good.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-emerald-700 mb-2">Tốt</p>
            <ul className="space-y-1">
              {res.good.map(c => (
                <li key={c.id} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600" />
                  <span>{c.label}{c.hint ? ` — ${c.hint}` : ''}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {res.warn.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-amber-700 mb-2">Nên cải thiện</p>
            <ul className="space-y-1">
              {res.warn.map(c => (
                <li key={c.id} className="flex items-start gap-2 text-sm">
                  <CircleAlert className="w-4 h-4 mt-0.5 text-amber-500" />
                  <span>{c.label}{c.hint ? ` — ${c.hint}` : ''}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {res.bad.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-rose-700 mb-2">Thiếu</p>
            <ul className="space-y-1">
              {res.bad.map(c => (
                <li key={c.id} className="flex items-start gap-2 text-sm">
                  <CircleAlert className="w-4 h-4 mt-0.5 text-rose-500" />
                  <span>{c.label}{c.hint ? ` — ${c.hint}` : ''}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
