'use client';

import { useTranslations } from 'next-intl';

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const t = useTranslations('DashboardError');

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-foreground mb-2">{t('title')}</h2>
      <p className="text-sm text-muted mb-6">
        {error.message || t('description')}
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg cursor-pointer"
      >
        {t('retry')}
      </button>
    </div>
  );
}
