type ActionErrorProps = {
  message: string;
  onDismiss?: () => void;
};

import { useTranslations } from 'next-intl';

export function ActionError({ message, onDismiss }: ActionErrorProps) {
  const t = useTranslations('Components.ActionError');
  if (!message) return null;

  return (
    <div className="bg-danger-light border border-danger/20 text-danger rounded-lg p-3 text-sm flex items-start justify-between gap-3">
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-danger/80 hover:text-danger shrink-0 cursor-pointer"
          aria-label={t('dismiss')}
        >
          ×
        </button>
      )}
    </div>
  );
}
