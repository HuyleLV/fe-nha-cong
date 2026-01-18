export function asImageSrc(input?: string | null): string | undefined {
  // Default to backend localhost if env not provided (dev friendly)
  const baseRaw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const base = baseRaw.replace(/\/+$/, '');
  const raw = (input || '').trim();
  if (!raw) return undefined;

  // If absolute URL or data URI, return as-is
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;

  // Ensure leading slash for backend-served assets
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  // Join with API base (do not add extra slash)
  return `${base}${path}`;
}

export function asMediaSrc(input?: string | null): string | undefined {
  const raw = (input || '').trim();
  if (!raw) return undefined;
  // YouTube/Vimeo links should be returned as-is
  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(raw)) return raw;
  // If it's already an absolute URL or data URI, return it
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  // Otherwise treat as backend-served path
  return asImageSrc(raw);
}
