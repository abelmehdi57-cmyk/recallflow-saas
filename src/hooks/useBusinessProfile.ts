'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessProfile } from '@/lib/supabase/types';

type UseBusinessProfileResult = {
  businessId: string | null;
  business: BusinessProfile | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
};

const BUSINESS_SELECT =
  'id, business_name, currency, language, timezone, business_type, default_appointment_value';

export function useBusinessProfile(supabase: SupabaseClient): UseBusinessProfileResult {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setBusinessId(null);
      setBusiness(null);
      setLoading(false);
      setError('You must be signed in.');
      return;
    }

    const { data, error: businessError } = await supabase
      .from('businesses')
      .select(BUSINESS_SELECT)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (businessError) {
      setBusinessId(null);
      setBusiness(null);
      setError(businessError.message);
    } else if (!data) {
      setBusinessId(null);
      setBusiness(null);
      setError('No business profile found. Complete setup from the dashboard first.');
    } else {
      setBusinessId(data.id);
      setBusiness({
        ...data,
        language: data.language ?? 'en',
        default_appointment_value: Number(data.default_appointment_value ?? 75),
      });
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { businessId, business, loading, error, refresh };
}

/** @deprecated Use useBusinessProfile for settings-aware pages */
export function useBusiness(supabase: SupabaseClient) {
  const result = useBusinessProfile(supabase);
  return {
    businessId: result.businessId,
    loading: result.loading,
    error: result.error,
    refresh: result.refresh,
  };
}
