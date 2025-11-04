import { fDate, formatStr } from "@/utils/format-time";

export default function ArticleCardSmall({
  title,
  slug,
  excerpt,
  cover,
  date,
}: {
  title?: string;
  slug?: string;
  excerpt?: string;
  cover?: string | null;
  date?: string | Date | null;
}) {
  const displayDate = date ? fDate(date, formatStr.split.date) : null;

  return (
    <a href={`/blog/` + (slug ?? "") }>
      <article className="group flex items-stretch gap-3 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm transition hover:shadow-md sm:gap-4">
        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl bg-emerald-50 sm:h-40 sm:w-40">
          {cover ? (
            <img
              src={(process.env.NEXT_PUBLIC_API_URL || "") + cover}
              alt={title ?? ""}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 animate-pulse bg-emerald-100" />
          )}
        </div>
        <div className="min-w-0 flex-1 flex flex-col">
          <h3 className="line-clamp-2 text-xl font-semibold text-emerald-900 group-hover:text-emerald-700">
            {title ?? (
              <span className="inline-block h-4 w-3/4 animate-pulse rounded bg-emerald-100" />
            )}
          </h3>
          <p className="mt-1 line-clamp-3 text-md text-emerald-900/70">
            {excerpt ?? (
              <span className="inline-block h-3 w-full animate-pulse rounded bg-emerald-100" />
            )}
          </p>
          {displayDate && displayDate !== "Invalid time value" && (
            <p className="mt-auto pt-2 text-start text-[13px] text-emerald-900/60">
              Ngày đăng: {displayDate}
            </p>
          )}
        </div>
      </article>
    </a>
  );
}
  