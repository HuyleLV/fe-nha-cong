"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CuDanSidebar from "./components/cuDanSidebar";
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

export default function CuDanLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const u = readStoredUser();
    if (!u) {
      router.replace("/dang-nhap");
      return;
    }
    // no special role check here: cu-dan area can be accessed by appropriate users
    setChecked(true);
  }, [pathname, router]);

  if (!checked) return null;

  return (
    <div className="flex">
      <CuDanSidebar />
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}
