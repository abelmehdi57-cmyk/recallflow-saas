type LoadingSpinnerProps = {
  label?: string;
  className?: string;
};

import { useTranslations } from 'next-intl';

export function LoadingSpinner({
  label,
  className = 'py-20',
}: LoadingSpinnerProps) {
  const t = useTranslations('Components.LoadingSpinner');
  const finalLabel = label ?? t('loading');
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div
        className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"
        aria-hidden="true"
      />
      <p className="text-sm text-muted">{finalLabel}</p>
    </div>
  );
}
