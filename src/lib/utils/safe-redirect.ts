/** Allow only same-origin relative paths (blocks open redirects). */
export function getSafeRedirectPath(next: string | null, fallback = '/dashboard'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return fallback;
  }
  if (next.includes('://') || next.includes('\\')) {
    return fallback;
  }
  return next;
}
