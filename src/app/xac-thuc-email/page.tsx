import VerifyEmailPage from "@/features/dang-ky/verify-email";
import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Xác thực email - Nhà cộng",
    description: "Xác thực email tài khoản",
    icons: {
      icon: '/logo.png',
    },
  };
}

export default async function Page() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] grid place-items-center">Đang tải...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}
