import { fDate, formatStr } from "@/utils/format-time";
import MyImage from "@/components/myImage";

export default function ArticleCardLarge({
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
        <article className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm flex h-full flex-col">
            <a href={`/blog/` + slug}>
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-emerald-50">
                    {cover ? (
                        <MyImage
                            src={(process.env.NEXT_PUBLIC_API_URL || "") + cover}
                            alt={title ?? ""}
                            className="h-full w-full"
                        />
                    ) : (
                        <div className="h-full w-full animate-pulse bg-emerald-100" />
                    )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                    <h2 className="text-2xl font-semibold leading-snug text-emerald-900">
                        {title ?? <span className="inline-block h-6 w-2/3 animate-pulse rounded bg-emerald-100" />}
                    </h2>
                    <p className="text-emerald-900/70 line-clamp-2">
                        {excerpt ?? (
                        <span className="inline-block h-4 w-full animate-pulse rounded bg-emerald-100" />
                        )}
                    </p>
                    {displayDate && displayDate !== "Invalid time value" && (
                      <p className="mt-auto pt-2 text-start text-sm text-emerald-900/60">Ngày đăng: {displayDate}</p>
                    )}
                </div>
            </a>
        </article>
    );
}