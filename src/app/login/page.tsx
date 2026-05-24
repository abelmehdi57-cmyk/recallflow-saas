'use client';

import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Logo, AuthGlow, authInputClass } from '@/components/ui/auth-shared';
import { ActionError } from '@/components/ui/action-error';

function LoginForm() {
  const t = useTranslations('Auth.login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Using useState for supabase client so it's not recreated on every render
  const [supabase] = useState(() => createClient());

  const urlError = searchParams.get('error') === 'auth' ? t('confirmationExpired') : '';
  const error = formError || urlError;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setFormError(getAuthErrorMessage(signInError));
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <AuthGlow />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-center mb-1">{t('title')}</h1>
          <p className="text-muted text-center mb-6 text-sm">{t('subtitle')}</p>

          {error && (
            <div className="mb-4">
              <ActionError message={error} />
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
                  {t('password')}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:text-primary-hover font-medium"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className={authInputClass}
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {t('noAccount')}{' '}
            <Link href="/signup" className="text-primary hover:text-primary-hover font-medium">
              {t('signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const t = useTranslations('Components.LoadingSpinner');
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted text-sm">
          {t('loading')}
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
