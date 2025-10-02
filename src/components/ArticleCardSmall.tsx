export default function ArticleCardSmall({
    title,
    slug,
    excerpt,
    cover,
  }: {
    title?: string;
    slug?: string;
    excerpt?: string;
    cover?: string | null;
  }) {
    return (
      <a href={`/blog/` + slug}>
        <article className="group grid grid-cols-3 gap-4 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm transition hover:shadow-md">
            <div className="relative col-span-1 overflow-hidden rounded-xl bg-emerald-50">
              {cover ? (
                <img
                  src={process.env.NEXT_PUBLIC_API_URL + cover}
                  alt={title ?? ""}
                  className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="h-28 w-full animate-pulse bg-emerald-100" />
              )}
            </div>
            <div className="col-span-2">
              <h3 className="line-clamp-2 text-base font-semibold text-emerald-900 group-hover:text-emerald-700">
                {title ?? <span className="inline-block h-4 w-3/4 animate-pulse rounded bg-emerald-100" />}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-emerald-900/70">
                {excerpt ?? <span className="inline-block h-3 w-full animate-pulse rounded bg-emerald-100" />}
              </p>
            </div>
        </article>
      </a>
    );
}
  