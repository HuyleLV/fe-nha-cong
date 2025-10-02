import BlogDetail from "@/features/blog/detail";
import { capitalizeWords } from "@/utils/capitalizeWords";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
    const { slug } = await params;
    return {
        title: `${capitalizeWords(slug.replaceAll("%20", " "))} | Nhà cộng`,
        description: `${capitalizeWords(slug.replaceAll("%20", " "))} | Nhà cộng`,
        icons: {
            icon: "/logo.png",
        },
    };
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    
    return <BlogDetail slug={slug} />
}