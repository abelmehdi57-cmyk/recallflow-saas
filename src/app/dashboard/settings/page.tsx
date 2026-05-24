'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { getPasswordResetRedirectUrl } from '@/lib/auth/site-url';
import { CURRENCIES, BUSINESS_TYPES, TIMEZONES } from '@/lib/constants/business';
import type { BusinessLanguage } from '@/lib/supabase/types';

const inputClass =
  'w-full px-4 py-2.5 bg-input border border-input-border rounded-lg text-foreground placeholder:text-muted text-sm';

const buttonClass =
  'inline-flex items-center justify-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

const LANGUAGE_OPTIONS: { value: BusinessLanguage; label: string }[] = [
  { value: 'en', label: 'English (en)' },
  { value: 'fr', label: 'Français (fr)' },
  { value: 'ar', label: 'العربية (ar)' },
];

export default function SettingsPage() {
  const t = useTranslations('SettingsPage');
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [loading, setLoading] = useState(true);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [language, setLanguage] = useState<BusinessLanguage>('en');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [businessType, setBusinessType] = useState('general');
  const [defaultAppointmentValue, setDefaultAppointmentValue] = useState('75');

  const [businessError, setBusinessError] = useState('');
  const [accountError, setAccountError] = useState('');
  const [businessSuccess, setBusinessSuccess] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      setLoading(true);
      setBusinessError('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setUserId(null);
        setLoading(false);
        setBusinessError(t('errors.signedInRequired'));
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? '');

      const { data: business, error } = await supabase
        .from('businesses')
        .select(
          'business_name, language, currency, timezone, business_type, default_appointment_value',
        )
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setBusinessError(error.message);
      } else if (business) {
        setBusinessName(business.business_name ?? '');
        setLanguage((business.language as BusinessLanguage | null) ?? 'en');
        setCurrency(business.currency ?? 'USD');
        setTimezone(business.timezone ?? 'UTC');
        setBusinessType(business.business_type ?? 'general');
        setDefaultAppointmentValue(String(business.default_appointment_value ?? 75));
      }

      setLoading(false);
    }

    void loadSettings();

    return () => {
      active = false;
    };
  }, [supabase, t]);

  useEffect(() => {
    if (!businessSuccess) return;
    const tTimer = window.setTimeout(() => setBusinessSuccess(''), 3000);
    return () => window.clearTimeout(tTimer);
  }, [businessSuccess]);

  useEffect(() => {
    if (!accountSuccess) return;
    const tTimer = window.setTimeout(() => setAccountSuccess(''), 3000);
    return () => window.clearTimeout(tTimer);
  }, [accountSuccess]);

  async function handleBusinessSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;

    const trimmedName = businessName.trim();
    const defaultVal = parseFloat(defaultAppointmentValue);

    if (!trimmedName) {
      setBusinessError(t('errors.businessNameRequired'));
      return;
    }
    if (Number.isNaN(defaultVal) || defaultVal < 0) {
      setBusinessError(t('errors.defaultAppointmentValueInvalid'));
      return;
    }

    setSavingBusiness(true);
    setBusinessError('');
    setBusinessSuccess('');

    const { error } = await supabase
      .from('businesses')
      .update({
        business_name: trimmedName,
        language,
        currency,
        timezone,
        business_type: businessType,
        default_appointment_value: defaultVal,
      })
      .eq('owner_id', userId);

    setSavingBusiness(false);

    if (error) {
      setBusinessError(error.message);
      return;
    }

    setBusinessSuccess(t('business.success'));
    
    // Slight delay before refreshing to ensure the UI updates nicely
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  async function handlePasswordReset() {
    if (!email) {
      setAccountError(t('errors.accountEmailMissing'));
      return;
    }

    setSendingReset(true);
    setAccountError('');
    setAccountSuccess('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetRedirectUrl(),
    });

    setSendingReset(false);

    if (error) {
      setAccountError(error.message);
      return;
    }

    setAccountSuccess(t('account.success'));
  }

  return (
    <div className="space-y-6">
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground">{t('business.title')}</h2>
        <p className="text-sm text-muted mt-1">
          {t('business.description')}
        </p>

        <form onSubmit={handleBusinessSave} className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="business-name" className="text-sm font-medium text-foreground">
              {t('business.fields.businessName')}
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={loading || savingBusiness}
              placeholder={t('business.placeholders.businessName')}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="business-type" className="text-sm font-medium text-foreground">
                {t('business.fields.businessType')}
              </label>
              <select
                id="business-type"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                disabled={loading || savingBusiness}
                className={inputClass}
              >
                {BUSINESS_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(`businessTypeOptions.${option.value}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium text-foreground">
                {t('business.fields.language')}
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as BusinessLanguage)}
                disabled={loading || savingBusiness}
                className={inputClass}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(`languageOptions.${option.value}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium text-foreground">
                {t('business.fields.currency')}
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={loading || savingBusiness}
                className={inputClass}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="timezone" className="text-sm font-medium text-foreground">
                {t('business.fields.timezone')}
              </label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={loading || savingBusiness}
                className={inputClass}
                dir="ltr"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="default-value" className="text-sm font-medium text-foreground">
                {t('business.fields.defaultAppointmentValue')}
              </label>
              <input
                id="default-value"
                type="number"
                min={0}
                step={1}
                value={defaultAppointmentValue}
                onChange={(e) => setDefaultAppointmentValue(e.target.value)}
                disabled={loading || savingBusiness}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button type="submit" disabled={loading || savingBusiness || !userId} className={buttonClass}>
              {savingBusiness ? t('business.saving') : t('business.save')}
            </button>
            {businessSuccess && <p className="text-sm text-success">{businessSuccess}</p>}
            {businessError && <p className="text-sm text-danger">{businessError}</p>}
          </div>
        </form>
      </section>

      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground">{t('account.title')}</h2>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="account-email" className="text-sm font-medium text-foreground">
              {t('account.fields.email')}
            </label>
            <input id="account-email" type="email" value={email} readOnly className={inputClass} dir="ltr" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={sendingReset || !email}
              className={buttonClass}
            >
              {sendingReset ? t('account.sending') : t('account.changePassword')}
            </button>
            {accountSuccess && <p className="text-sm text-success">{accountSuccess}</p>}
            {accountError && <p className="text-sm text-danger">{accountError}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
