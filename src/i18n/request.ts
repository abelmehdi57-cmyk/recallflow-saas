import { getRequestConfig } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { defaultLocale, isValidLocale } from '@/i18n/config';

async function getBusinessLocale() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return defaultLocale;
    }

    const { data: business, error } = await supabase
      .from('businesses')
      .select('language')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !isValidLocale(business?.language)) {
      return defaultLocale;
    }

    return business.language;
  } catch {
    return defaultLocale;
  }
}

export default getRequestConfig(async () => {
  const locale = await getBusinessLocale();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
