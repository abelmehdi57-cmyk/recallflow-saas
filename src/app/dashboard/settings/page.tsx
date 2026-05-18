'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const inputClass =
  'w-full px-4 py-2.5 bg-input border border-input-border rounded-lg text-foreground placeholder:text-muted text-sm';

const buttonClass =
  'inline-flex items-center justify-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

export default function SettingsPage() {
  const [supabase] = useState(() => createClient());

  const [loading, setLoading] = useState(true);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [businessError, setBusinessError] = useState('');
  const [accountError, setAccountError] = useState('');
  const [businessSuccess, setBusinessSuccess] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      setLoading(true);
      setBusinessError('');
      setAccountError('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setUserId(null);
        setEmail('');
        setBusinessName('');
        setBusinessError('You must be signed in to manage settings.');
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? '');

      const { data: business, error } = await supabase
        .from('businesses')
        .select('business_name')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setBusinessName('');
        setBusinessError(error.message);
      } else {
        setBusinessName(business?.business_name ?? '');
      }

      setLoading(false);
    }

    void loadSettings();

    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!businessSuccess) return;

    const timeout = window.setTimeout(() => {
      setBusinessSuccess('');
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [businessSuccess]);

  useEffect(() => {
    if (!accountSuccess) return;

    const timeout = window.setTimeout(() => {
      setAccountSuccess('');
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [accountSuccess]);

  async function handleBusinessSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!userId) {
      setBusinessError('You must be signed in to manage settings.');
      return;
    }

    const trimmedName = businessName.trim();

    if (!trimmedName) {
      setBusinessError('Business name is required.');
      return;
    }

    setSavingBusiness(true);
    setBusinessError('');
    setBusinessSuccess('');

    const { error } = await supabase
      .from('businesses')
      .update({ business_name: trimmedName })
      .eq('owner_id', userId);

    setSavingBusiness(false);

    if (error) {
      setBusinessError(error.message);
      return;
    }

    setBusinessName(trimmedName);
    setBusinessSuccess('Saved!');
  }

  async function handlePasswordReset() {
    if (!email) {
      setAccountError('No email address found for this account.');
      return;
    }

    setSendingReset(true);
    setAccountError('');
    setAccountSuccess('');

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setSendingReset(false);

    if (error) {
      setAccountError(error.message);
      return;
    }

    setAccountSuccess('Password reset email sent!');
  }

  return (
    <div className="space-y-6">
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground">Business Profile</h2>

        <form onSubmit={handleBusinessSave} className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="business-name" className="text-sm font-medium text-foreground">
              Business Name
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={loading || savingBusiness}
              placeholder={loading ? 'Loading business name…' : 'Business name'}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="submit"
              disabled={loading || savingBusiness || !userId}
              className={buttonClass}
            >
              {savingBusiness ? 'Saving…' : 'Save'}
            </button>

            {loading && <p className="text-sm text-muted">Loading business name…</p>}
            {businessSuccess && <p className="text-sm text-success">{businessSuccess}</p>}
            {businessError && <p className="text-sm text-danger">{businessError}</p>}
          </div>
        </form>
      </section>

      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground">Account</h2>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="account-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="account-email"
              type="email"
              value={email}
              readOnly
              className={inputClass}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={sendingReset || !email}
              className={buttonClass}
            >
              {sendingReset ? 'Sending…' : 'Change Password'}
            </button>

            {accountSuccess && <p className="text-sm text-success">{accountSuccess}</p>}
            {accountError && <p className="text-sm text-danger">{accountError}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
