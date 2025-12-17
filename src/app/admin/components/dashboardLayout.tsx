"use client";

import Sidebar from "@/app/admin/components/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("tokenAdmin");
    const infoString = localStorage.getItem("adminInfo");
    const info = infoString ? JSON.parse(infoString) : null;

    // If token exists, check expiry (exp in JWT payload)
    let tokenValid = !!token;
    if (token) {
      try {
        const [, payload] = token.split(".");
        if (payload) {
          const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
          if (json.exp && typeof json.exp === "number") {
            const now = Date.now() / 1000;
            if (now > json.exp) tokenValid = false;
          }
        }
      } catch {
        tokenValid = false;
      }
    }

    if (!tokenValid) {
      // clear stale admin storage
      try {
        localStorage.removeItem("tokenAdmin");
        localStorage.removeItem("adminInfo");
      } catch {}
    }

    if ((!tokenValid || info?.role !== "admin") && !pathname.includes("/login")) {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  const isLogin = pathname.includes("/login");

  return (
    <div className="flex">
      {!isLogin && <Sidebar />}
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}
