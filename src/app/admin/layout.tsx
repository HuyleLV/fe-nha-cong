import type { Metadata } from "next";
import DashboardLayoutClient from "./components/dashboardLayout";

export const metadata: Metadata = {
  title: "Đăng nhập Admin Nhà Cộng",
  description: "Đăng nhập Admin Nhà Cộng",
  icons: {
    icon: "/logo.png",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
