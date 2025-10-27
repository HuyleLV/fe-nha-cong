import type { Metadata } from "next";
import { capitalizeWords } from "./capitalizeWords";

export const defaultMetadata: Metadata = {
  title: "Nhà cộng: Ở là cộng",
  description: "Nhà cộng: Ở là cộng",
  icons: {
    icon: "/logo.png",
  },
};

export function createMetadata(override?: Partial<Metadata>): Metadata {
  return {
    ...defaultMetadata,
    ...(override ?? {}),
  };
}

export function buildTitleFromSlug(slug: string): string {
  const text = capitalizeWords(slug.replaceAll("%20", " "));
  return `${text} | Nhà cộng`;
}

export function resolveMaybePromise<T>(value: T | Promise<T>): Promise<T> {
  return Promise.resolve(value);
}
