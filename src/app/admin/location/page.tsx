"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LocationIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/location/province");
  }, [router]);
  return null;
}