'use server';

import { createClient } from '@/lib/supabase/server';
import { getOrCreateBusiness } from '@/lib/supabase/business';
import { revalidatePath } from 'next/cache';

export async function ensureBusinessProfile(): Promise<{
  ok: boolean;
  message: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'You must be signed in.' };
  }

  const { business, setupRequired } = await getOrCreateBusiness(supabase, user);

  if (business) {
    revalidatePath('/dashboard');
    return { ok: true, message: 'Business profile ready.' };
  }

  if (setupRequired) {
    return {
      ok: false,
      message:
        'Database tables are missing. Run supabase/schema.sql in the Supabase SQL Editor first.',
    };
  }

  return {
    ok: false,
    message: 'Could not create your business profile. Check Supabase logs and RLS policies.',
  };
}
