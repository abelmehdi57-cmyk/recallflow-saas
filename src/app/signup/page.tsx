'use client';

import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import Link from 'next/link';
import { getClientSiteUrl } from '@/lib/auth/site-url';
import { useTranslations } from 'next-intl';
import { Logo, AuthGlow, authInputClass } from '@/components/ui/auth-shared';
import { ActionError } from '@/components/ui/action-error';
import { useSearchParams } from 'next/navigation';

function SignupForm() {
  const t = useTranslations('Auth.signup');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supabase] = useState(() => createClient());

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
        },
        emailRedirectTo: `${getClientSiteUrl()}/auth/callback`,
      },
    });

    if (signUpError) {
      setFormError(getAuthErrorMessage(signUpError));
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <AuthGlow />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-1">{t('title')}</h1>
          <p className="text-muted text-center mb-6 text-sm">{t('subtitle')}</p>

          {formError && (
            <div className="mb-4">
              <ActionError message={formError} />
            </div>
          )}

          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-success-light text-success rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-foreground font-medium mb-2">{t('checkEmail')}</p>
              <Link href="/login" className="text-sm text-primary hover:text-primary-hover font-medium">
                {t('backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="business" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('businessName')}
                </label>
                <input
                  id="business"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  autoComplete="organization"
                  placeholder="The Golden Comb"
                  className={authInputClass}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={authInputClass}
                  dir="ltr"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('password')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="••••••••"
                  className={authInputClass}
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg text-sm transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer mt-2"
              >
                {loading ? t('creatingAccount') : t('createAccount')}
              </button>
            </form>
          )}

          {!success && (
            <p className="mt-6 text-center text-sm text-muted">
              {t('haveAccount')}{' '}
              <Link href="/login" className="text-primary hover:text-primary-hover font-medium">
                {t('signIn')}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const t = useTranslations('Components.LoadingSpinner');
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted text-sm">
          {t('loading')}
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
