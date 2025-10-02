export default function ArticleCardLarge({
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
        <article className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <a href={`/blog/` + slug}>
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-emerald-50">
                    {cover ? (
                        <img
                        src={process.env.NEXT_PUBLIC_API_URL + cover}
                        alt={title ?? ""}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                    ) : (
                        <div className="h-full w-full animate-pulse bg-emerald-100" />
                    )}
                </div>
                <div className="space-y-2 p-6">
                    <h2 className="text-2xl font-semibold leading-snug text-emerald-900">
                        {title ?? <span className="inline-block h-6 w-2/3 animate-pulse rounded bg-emerald-100" />}
                    </h2>
                    <p className="text-emerald-900/70 line-clamp-2">
                        {excerpt ?? (
                        <span className="inline-block h-4 w-full animate-pulse rounded bg-emerald-100" />
                        )}
                    </p>
                </div>
            </a>
        </article>
    );
}