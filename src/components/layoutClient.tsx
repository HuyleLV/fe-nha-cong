"use client";

import { useEffect, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      setIsAdmin(pathname.startsWith("/admin"));
    }
  }, []);

  return (
    <>
      {!isAdmin && <Header />}
      <main className="min-h-screen bg-gray-50">{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}
