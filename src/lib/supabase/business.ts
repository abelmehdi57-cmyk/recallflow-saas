import type { SupabaseClient, User } from '@supabase/supabase-js';

export type BusinessRow = { id: string };

export async function getOrCreateBusiness(
  supabase: SupabaseClient,
  user: User
): Promise<{ business: BusinessRow | null; setupRequired: boolean }> {
  const { data: existing, error: selectError } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (existing?.id) {
    return { business: existing, setupRequired: false };
  }

  if (selectError) {
    const missingTable =
      selectError.message.includes('does not exist') ||
      selectError.code === '42P01';
    return { business: null, setupRequired: missingTable };
  }

  const businessName =
    (typeof user.user_metadata?.business_name === 'string' &&
      user.user_metadata.business_name.trim()) ||
    'My Business';

  const { data: created, error: insertError } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      business_name: businessName,
    })
    .select('id')
    .single();

  if (created?.id) {
    return { business: created, setupRequired: false };
  }

  if (insertError) {
    const missingTable =
      insertError.message.includes('does not exist') ||
      insertError.code === '42P01';
    return { business: null, setupRequired: missingTable };
  }

  return { business: null, setupRequired: true };
}
