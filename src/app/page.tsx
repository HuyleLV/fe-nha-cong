import TrangChu from "@/features/trang-chu";
import type { Metadata } from "next";
import { defaultMetadata } from "@/utils/next-helpers";

export async function generateMetadata(): Promise<Metadata> {
  return defaultMetadata;
}

export default async function Home() {
  return <TrangChu />;
}
