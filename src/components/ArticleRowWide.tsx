import { fDate, formatStr } from "@/utils/format-time";

export default function ArticleRowWide({
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
    date?: string;
  }) {
    const displayDate = date ? fDate(date, formatStr.split.date) : null;
    return (
      <a href={`/blog/` + slug}>
        <article
          className="grid grid-cols-3 items-start gap-4
                    rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm
                    transition hover:shadow-md hover:border-emerald-200"
        >
            <div className="overflow-hidden rounded-2xl">
              {cover ? (
                <img
                  src={process.env.NEXT_PUBLIC_API_URL + cover}
                  alt={title ?? ""}
                  className="h-44 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-48 md:h-56"
                />
              ) : (
                <div className="h-44 w-full animate-pulse rounded-2xl bg-emerald-100 sm:h-48 md:h-56" />
              )}
            </div>

            <div className="col-span-2">
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-emerald-900 hover:text-emerald-700 line-clamp-2">
                {title ?? <span className="inline-block h-6 w-2/3 animate-pulse rounded bg-emerald-100" />}
              </h3>
      
              <p className="mt-2 text-emerald-900/70 line-clamp-3">
                {excerpt ?? (
                  <span className="inline-block h-4 w-full animate-pulse rounded bg-emerald-100" />
                )}
              </p>
      
              {/* Meta (ẩn nếu không có date) */}
              {displayDate && displayDate !== "Invalid time value" ? (
                <div className="mt-3 text-sm text-emerald-800/70">
                  {displayDate}
                </div>
              ) : null}
            </div>
        </article>
      </a>
    );
  }
  