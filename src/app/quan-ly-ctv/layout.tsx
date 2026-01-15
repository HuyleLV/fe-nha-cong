"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CtvSidebar from "./components/ctvSidebar";
import type { User } from "@/type/user";

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
    if (raw) return JSON.parse(raw) as User;
    const adminInfo = localStorage.getItem("adminInfo");
    if (adminInfo) return JSON.parse(adminInfo) as User;
    const token = localStorage.getItem("tokenAdmin") || localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (token) {
      try {
        const [, payload] = token.split(".");
        if (payload) {
          const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
          return {
            id: Number(json.sub),
            email: json.email,
            role: json.role,
            name: json.name,
            avatarUrl: json.avatarUrl,
            phone: json.phone,
          } as User;
        }
      } catch { }
    }
    return null;
  } catch {
    return null;
  }
}

export default function CtvLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const u = readStoredUser();
    if (!u) { router.replace('/dang-nhap'); return; }
    const isCtv = String(u.role).toLowerCase() === 'ctv' || (u as any).isCtv || (u as any).isCTV;
    if (!isCtv) { router.replace('/dang-nhap'); return; }
    setChecked(true);
  }, [pathname, router]);

  if (!checked) return null;

  return (
    <div className="flex">
      <CtvSidebar />
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}
