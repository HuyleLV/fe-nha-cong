"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DanhSachCuDanPage() {
  const router = useRouter();
  useEffect(() => {
    // Redirect to the resident overview to keep the personal resident area free of a resident list
    try {
      router.replace("/quan-ly-cu-dan");
    } catch {}
  }, [router]);

  return null;
}
