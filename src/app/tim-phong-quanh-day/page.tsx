import Blog from "@/features/blog";
import TimPhongQuanhDayPage from "@/features/tim-phong-quanh-day";
import type { Metadata } from "next";
import { defaultMetadata } from "@/utils/next-helpers";

export async function generateMetadata(): Promise<Metadata> {
  return defaultMetadata;
}

export default async function Page() {
  return <TimPhongQuanhDayPage />;
}
