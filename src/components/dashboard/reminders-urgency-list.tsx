import Link from 'next/link';
import { URGENCY_STYLES, getReminderUrgency } from '@/lib/reminders/urgency';
import type { ReminderWithClient } from '@/lib/supabase/types';
import { useTranslations, useLocale } from 'next-intl';

type RemindersUrgencyListProps = {
  reminders: ReminderWithClient[];
  timezone?: string;
};

function clientName(reminder: ReminderWithClient, t: (key: string) => string): string {
  const c = reminder.clients;
  if (!c) return t('unknownClient');
  if (Array.isArray(c)) return c[0]?.name ?? t('unknownClient');
  return c.name;
}

export function RemindersUrgencyList({ reminders, timezone }: RemindersUrgencyListProps) {
  const t = useTranslations('DashboardWidgets.RemindersUrgencyList');
  const locale = useLocale();

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('title')}</h2>
        <Link href="/dashboard/reminders" className="text-sm text-primary hover:text-primary-hover">
          {t('viewAll')}
        </Link>
      </div>
      {reminders.length === 0 ? (
        <p className="text-sm text-muted py-6 text-center">
          {t('empty')}{' '}
          <Link href="/dashboard/reminders" className="text-primary underline">
            {t('addOne')}
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {reminders.map((reminder) => {
            const urgency = getReminderUrgency(reminder.date, reminder.done ?? false);
            const style = URGENCY_STYLES[urgency];
            return (
              <li
                key={reminder.id}
                className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border/50"
              >
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${style.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-foreground">{reminder.message}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {clientName(reminder, t)} ·{' '}
                    {new Date(reminder.date).toLocaleString(locale, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: timezone || undefined,
                    })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}