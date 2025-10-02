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

    if ((!token || info?.role !== "admin") && !pathname.includes("/login")) {
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
