"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "../components/header";
import Footer from "../components/footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = !!pathname && pathname.startsWith("/admin");
  const isHostArea = !!pathname && pathname.startsWith("/quan-ly-chu-nha");
  const isPrintView = !!pathname && pathname.includes('/print-invoice');

  return (
    <>
      {!isAdmin && !isPrintView && <Header />}
      <main className="min-h-screen bg-gray-50">{children}</main>
      {!isAdmin && !isHostArea && !isPrintView && <Footer />}
    </>
  );
}
