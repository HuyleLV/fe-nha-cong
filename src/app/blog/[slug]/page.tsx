import BlogDetail from "@/features/blog/detail";
import type { Metadata } from "next";
import { buildTitleFromSlug, resolveMaybePromise } from "@/utils/next-helpers";

type PageParams = { slug: string };

export async function generateMetadata(
  { params }: { params: PageParams | Promise<PageParams> }
): Promise<Metadata> {
  const { slug } = await resolveMaybePromise(params);
  const title = buildTitleFromSlug(slug);
  return {
    title,
    description: title,
    icons: { icon: "/logo.png" },
  };
}

export default async function Page(
  props: { params: PageParams } | { params: Promise<PageParams> }
) {
  const { slug } = await resolveMaybePromise((props as any).params);
  return <BlogDetail slug={slug} />
}