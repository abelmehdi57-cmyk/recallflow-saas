import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateBusiness } from '@/lib/supabase/business';
import { getDashboardData } from '@/lib/dashboard/get-dashboard-data';
import { SetupNotice } from '@/components/setup-notice';
import { LostRevenueWidget } from '@/components/dashboard/lost-revenue-widget';
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments';
import { RemindersUrgencyList } from '@/components/dashboard/reminders-urgency-list';
import { WeeklyTrendChart } from '@/components/dashboard/weekly-trend-chart';
import { AppointmentAnalytics } from '@/components/dashboard/appointment-analytics';

export default async function DashboardPage() {
  const t = await getTranslations('DashboardPage');
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { business, setupRequired } = await getOrCreateBusiness(supabase, user);

  if (!business?.id) {
    return (
      <SetupNotice
        title={setupRequired ? t('setupRequiredTitle') : t('businessMissingTitle')}
        description={
          setupRequired
            ? t('setupRequiredDescription')
            : t('businessMissingDescription')
        }
      />
    );
  }

  const data = await getDashboardData(supabase, business.id);

  if (!data) {
    return (
      <SetupNotice
        title={t('loadFailedTitle')}
        description={t('loadFailedDescription')}
      />
    );
  }

  const { business: profile, stats } = data;

  const statCards = [
    {
      label: t('stats.todayAppointments'),
      value: stats.todayAppointments,
      color: 'text-primary',
      bg: 'bg-primary-light',
    },
    {
      label: t('stats.pendingFollowUps'),
      value: stats.pendingFollowUps,
      color: 'text-warning',
      bg: 'bg-warning-light',
    },
    {
      label: t('stats.noShowsMonth'),
      value: stats.noShowsMonth,
      color: 'text-danger',
      bg: 'bg-danger-light',
    },
    {
      label: t('stats.pendingReminders'),
      value: stats.pendingReminders,
      color: 'text-success',
      bg: 'bg-success-light',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
          >
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LostRevenueWidget
          amount={data.lostRevenue}
          noShowCount={stats.noShowsMonth}
          currency={profile.currency}
        />
        <UpcomingAppointments
          appointments={data.upcomingAppointments}
          timezone={profile.timezone}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyTrendChart data={data.weeklyTrend} />
        <AppointmentAnalytics
          statusCounts={data.statusCounts}
          total={data.appointmentsLast30Total}
        />
      </div>

      <RemindersUrgencyList reminders={data.reminders} timezone={profile.timezone} />

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/dashboard/clients"
          className="px-4 py-2 bg-card border border-border rounded-lg hover:border-primary/40 text-foreground"
        >
          {t('actions.manageClients')}
        </Link>
        <Link
          href="/dashboard/appointments"
          className="px-4 py-2 bg-card border border-border rounded-lg hover:border-primary/40 text-foreground"
        >
          {t('actions.manageAppointments')}
        </Link>
        <Link
          href="/dashboard/settings"
          className="px-4 py-2 bg-card border border-border rounded-lg hover:border-primary/40 text-muted"
        >
          {t('actions.businessSettings')}
        </Link>
      </div>
    </div>
  );
}
