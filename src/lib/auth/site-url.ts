/** Origin for auth redirect URLs (client-safe). */
export function getClientSiteUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

/** Password recovery completes via callback, then lands here. */
export function getPasswordResetRedirectUrl(): string {
  const origin = getClientSiteUrl();
  return `${origin}/auth/callback?next=${encodeURIComponent('/auth/update-password')}`;
}
