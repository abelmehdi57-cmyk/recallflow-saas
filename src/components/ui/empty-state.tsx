import Link from 'next/link';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  actionDisabled,
}: EmptyStateProps) {
  const actionClass =
    'inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-muted text-sm max-w-sm mb-6">{description}</p>
      {actionLabel &&
        (actionHref ? (
          <Link href={actionHref} className={actionClass}>
            {actionLabel}
          </Link>
        ) : onAction ? (
          <button type="button" onClick={onAction} disabled={actionDisabled} className={actionClass}>
            {actionLabel}
          </button>
        ) : null)}
    </div>
  );
}
