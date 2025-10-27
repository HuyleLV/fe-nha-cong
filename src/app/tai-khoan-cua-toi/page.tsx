import AccountPage from "@/features/tai-khoan-cua-toi";
import type { Metadata } from "next";
import { defaultMetadata } from "@/utils/next-helpers";

export async function generateMetadata(): Promise<Metadata> {
  return defaultMetadata;
}

export default async function Page() {
  return <AccountPage />;
}
