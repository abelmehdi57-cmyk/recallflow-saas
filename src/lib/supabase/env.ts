function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  return (
    lower.includes('your-project-url') ||
    lower.includes('your-anon-key') ||
    lower === 'undefined'
  );
}

export function getSupabaseEnv(): {
  url: string;
  anonKey: string;
} | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isPlaceholder(url) || isPlaceholder(anonKey)) {
    return null;
  }

  try {
    const parsed = new URL(url!);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
  } catch {
    return null;
  }

  return { url: url!, anonKey: anonKey! };
}

export const SUPABASE_SETUP_MESSAGE =
  'Supabase is not configured. In recallflow/.env.local set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from your project: https://supabase.com/dashboard → Project Settings → API';
