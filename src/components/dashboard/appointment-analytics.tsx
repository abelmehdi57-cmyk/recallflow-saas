import { getAppointmentStatusLabel } from '@/lib/appointments/status';
import { useTranslations } from 'next-intl';
import type { StatusCount } from '@/lib/dashboard/analytics';

type AppointmentAnalyticsProps = {
  statusCounts: StatusCount[];
  total: number;
};

export function AppointmentAnalytics({ statusCounts, total }: AppointmentAnalyticsProps) {
  const t = useTranslations('DashboardWidgets.AppointmentAnalytics');
  const max = Math.max(...statusCounts.map((s) => s.count), 1);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-lg font-semibold text-foreground mb-1">{t('title')}</h2>
      <p className="text-sm text-muted mb-4">{t('subtitle', { total })}</p>
      <ul className="space-y-3">
        {statusCounts.map(({ status, count }) => (
          <li key={status}>
            <div className="flex justify-between text-sm mb-1">
              <span className={`font-medium ${count > 0 ? 'text-foreground' : 'text-muted'}`}>
                {getAppointmentStatusLabel(status)}
              </span>
              <span className="text-muted">{count}</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  status === 'no-show'
                    ? 'bg-danger'
                    : status === 'completed'
                      ? 'bg-success'
                      : status === 'confirmed'
                        ? 'bg-primary'
                        : 'bg-muted'
                }`}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
