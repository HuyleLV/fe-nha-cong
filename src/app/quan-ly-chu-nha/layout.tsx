import type { Metadata } from "next";
import HostLayoutClient from "./components/hostLayout";

export const metadata: Metadata = {
  title: "Quản lý Chủ nhà",
  description: "Bảng điều khiển cho Chủ nhà",
  icons: { icon: "/logo.png" },
};

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return <HostLayoutClient>{children}</HostLayoutClient>;
}
