import VeChungToiPage from "@/features/ve-chung-toi";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Nhà cộng: Ở là cộng",
    description: "Nhà cộng: Ở là cộng",
    icons: {
      icon: '/logo.png',
    },
  };
}

export default async function Page() {
  return <VeChungToiPage />;
}