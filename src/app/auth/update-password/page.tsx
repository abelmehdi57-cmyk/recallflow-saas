'use client';

import { Suspense, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Logo, AuthGlow, authInputClass } from '@/components/ui/auth-shared';
import { ActionError } from '@/components/ui/action-error';

function UpdatePasswordForm() {
  const t = useTranslations('Auth.updatePassword');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createClient());

  const urlError = searchParams.get('error_description') || searchParams.get('error');

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session && !urlError) {
        setError(t('expired'));
      } else if (urlError) {
        setError(urlError);
      }
      setVerifying(false);
    }
    
    void checkSession();
  }, [supabase.auth, urlError, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('passwordMismatch') || "Passwords don't match"); // Fallback if missing in dict
      return;
    }

    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(getAuthErrorMessage(updateError));
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

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-1">{t('title')}</h1>
          <p className="text-muted text-center mb-6 text-sm">{t('subtitle')}</p>

          {error && (
            <div className="mb-4">
              <ActionError message={error} />
            </div>
          )}

          {verifying ? (
            <div className="text-center py-8 text-sm text-muted">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              {t('verifying')}
            </div>
          ) : error && !urlError ? (
             <div className="text-center py-4">
              <Link
                href="/forgot-password"
                className="inline-flex px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg text-sm transition-colors"
              >
                {t('requestNew')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('newPassword')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={authInputClass}
                  dir="ltr"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
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
                {loading ? t('updating') : t('update')}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/login" className="text-primary hover:text-primary-hover font-medium">
              {t('backToLogin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  const t = useTranslations('Components.LoadingSpinner');
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted text-sm">
          {t('loading')}
        </div>
      }
    >
      <UpdatePasswordForm />
    </Suspense>
  );
}
