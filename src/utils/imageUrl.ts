export function asImageSrc(input?: string | null): string | undefined {
  const base = process.env.NEXT_PUBLIC_API_URL || '';
  const raw = (input || '').trim();
  if (!raw) return undefined;

  // If absolute URL or data URI, return as-is
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;

  // Ensure leading slash for backend-served assets
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  // Join with API base (do not add extra slash)
  return `${base}${path}`;
}
