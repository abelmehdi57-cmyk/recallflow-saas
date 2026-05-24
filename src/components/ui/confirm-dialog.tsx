'use client';

import { useTranslations } from 'next-intl';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useTranslations('Components.ConfirmDialog');
  
  const finalConfirmLabel = confirmLabel ?? t('confirm');
  const finalCancelLabel = cancelLabel ?? t('cancel');
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={onCancel}
        disabled={loading}
        aria-label={t('close')}
      />
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl p-6 z-10">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h2>
        <p id="confirm-dialog-message" className="text-sm text-muted mb-6">
          {message}
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-card-hover disabled:opacity-50 cursor-pointer"
          >
            {finalCancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 cursor-pointer ${
              destructive
                ? 'bg-danger hover:bg-danger/90'
                : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            {loading ? t('working') : finalConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
