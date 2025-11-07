import Blog from "@/features/blog";
import TimPhongQuanhDayPage from "@/features/tim-phong-quanh-day";
import { Suspense } from "react";
import type { Metadata } from "next";
import { defaultMetadata } from "@/utils/next-helpers";

export async function generateMetadata(): Promise<Metadata> {
  return defaultMetadata;
}

export default async function Page() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] grid place-items-center text-sm text-slate-500">Đang tải…</div>}>
      <TimPhongQuanhDayPage />
    </Suspense>
  );
}
