'use client';

import { useState, useTransition } from 'react';
import { ensureBusinessProfile } from '@/app/dashboard/actions';

type SetupNoticeProps = {
  title: string;
  description: string;
  showRetry?: boolean;
};

export function SetupNotice({ title, description, showRetry = true }: SetupNoticeProps) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleRetry = () => {
    startTransition(async () => {
      const result = await ensureBusinessProfile();
      setMessage(result.message);
      if (result.ok) {
        window.location.reload();
      }
    });
  };

  return (
    <div className="bg-card border border-warning/30 rounded-xl p-6 max-w-lg space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted leading-relaxed">{description}</p>
      </div>

      {showRetry && (
        <button
          type="button"
          onClick={handleRetry}
          disabled={isPending}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'Setting up...' : 'Create my business profile'}
        </button>
      )}

      {message && (
        <p className={`text-sm ${message.includes('ready') ? 'text-success' : 'text-danger'}`}>
          {message}
        </p>
      )}

      <details className="text-sm text-muted">
        <summary className="cursor-pointer text-foreground/80 hover:text-foreground">
          First time? Run the database schema
        </summary>
        <ol className="mt-2 space-y-1 list-decimal list-inside">
          <li>
            Open{' '}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Supabase Dashboard
            </a>
          </li>
          <li>SQL Editor → New query</li>
          <li>Paste the contents of <code className="text-foreground">supabase/schema.sql</code></li>
          <li>Run, then click the button above</li>
        </ol>
      </details>
    </div>
  );
}
