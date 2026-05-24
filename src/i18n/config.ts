import type { BusinessLanguage } from '@/lib/supabase/types';

export const locales = ['en', 'fr', 'ar'] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'en';

export function isValidLocale(value: string | null | undefined): value is AppLocale {
  return locales.includes((value ?? '') as AppLocale);
}

export function isRtlLocale(locale: AppLocale): boolean {
  return locale === 'ar';
}

export function normalizeLocale(value: string | null | undefined): BusinessLanguage {
  return isValidLocale(value) ? value : defaultLocale;
}
