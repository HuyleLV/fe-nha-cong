import LoginPage from "@/features/dang-nhap";
import type { Metadata } from "next";
import { defaultMetadata } from "@/utils/next-helpers";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  return defaultMetadata;
}

export default async function Page() {
  return (
    <Suspense fallback={<div className="p-4">Đang tải…</div>}>
      <LoginPage />
    </Suspense>
  );
}
