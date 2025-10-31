// Helper to build absolute API URLs based on NEXT_PUBLIC_API_URL
export function apiUrl(path: string): string {
  const baseRaw = process.env.NEXT_PUBLIC_API_URL || "";
  const base = baseRaw.replace(/\/+$/, "");
  let p = path.startsWith("/") ? path : `/${path}`;
  // Avoid double '/api' if base already ends with '/api' and path starts with '/api'
  if (/\/api$/i.test(base) && /^\/api(\/|$)/i.test(p)) {
    p = p.replace(/^\/api/i, "");
    if (!p.startsWith("/")) p = "/" + p;
  }
  return `${base}${p}`;
}
