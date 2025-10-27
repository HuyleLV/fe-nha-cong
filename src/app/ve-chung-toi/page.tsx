import VeChungToiPage from "@/features/ve-chung-toi";
import type { Metadata } from "next";
import { defaultMetadata } from "@/utils/next-helpers";

export async function generateMetadata(): Promise<Metadata> {
  return defaultMetadata;
}

export default async function Page() {
  return <VeChungToiPage />;
}