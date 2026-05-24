import Link from 'next/link';
import { StatusBadge } from '@/components/appointments/status-badge';
import type { AppointmentStatus } from '@/lib/supabase/types';
import { useTranslations, useLocale } from 'next-intl';

export type UpcomingAppointmentRow = {
  id: string;
  date: string;
  status: AppointmentStatus;
  clientName: string;
};

type UpcomingAppointmentsProps = {
  appointments: UpcomingAppointmentRow[];
  timezone?: string;
};

function formatDate(iso: string, locale: string, timezone?: string) {
  return new Date(iso).toLocaleString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone || undefined,
  });
}

export function UpcomingAppointments({ appointments, timezone }: UpcomingAppointmentsProps) {
  const t = useTranslations('DashboardWidgets.UpcomingAppointments');
  const locale = useLocale();
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('title')}</h2>
        <Link href="/dashboard/appointments" className="text-sm text-primary hover:text-primary-hover">
          {t('viewAll')}
        </Link>
      </div>
      {appointments.length === 0 ? (
        <p className="text-sm text-muted py-6 text-center">
          {t('empty')}{' '}
          <Link href="/dashboard/appointments" className="text-primary underline">
            {t('scheduleOne')}
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {appointments.map((apt) => (
            <li
              key={apt.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-background rounded-lg border border-border/50"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{apt.clientName}</p>
                <p className="text-xs text-muted">{formatDate(apt.date, locale, timezone)}</p>
              </div>
              <StatusBadge status={apt.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
