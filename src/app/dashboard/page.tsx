import { createClient } from '@/lib/supabase/server';
import { getOrCreateBusiness } from '@/lib/supabase/business';
import { SetupNotice } from '@/components/setup-notice';
import { startOfMonth, startOfToday, startOfTomorrow } from '@/lib/dashboard/dates';
import type { ReminderWithClient } from '@/lib/supabase/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { business, setupRequired } = await getOrCreateBusiness(supabase, user);

  if (!business?.id) {
    return (
      <SetupNotice
        title={setupRequired ? 'Database setup required' : 'Business profile missing'}
        description={
          setupRequired
            ? 'Your Supabase project needs the RecallFlow tables. Run the schema in the SQL Editor, then click the button below.'
            : 'Your account exists but has no business profile yet. Click below to create one automatically.'
        }
      />
    );
  }

  const businessId = business.id;
  const today = startOfToday();
  const tomorrow = startOfTomorrow(today);
  const firstOfMonth = startOfMonth(today);
  const now = new Date();

  const [
    { count: todayAppointments },
    { count: pendingFollowUps },
    { count: noShows },
    { count: pendingReminders },
    { data: upcomingReminders },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString()),
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'follow-up'),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('showed_up', false)
      .eq('confirmed', true)
      .gte('date', firstOfMonth.toISOString())
      .lt('date', now.toISOString()),
    supabase
      .from('reminders')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('done', false)
      .lte('date', tomorrow.toISOString()),
    supabase
      .from('reminders')
      .select('id, message, date, clients(name)')
      .eq('business_id', businessId)
      .eq('done', false)
      .order('date', { ascending: true })
      .limit(3),
  ]);

  const stats = [
    {
      label: "Today's Appointments",
      value: todayAppointments ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      color: 'text-primary',
      bg: 'bg-primary-light',
    },
    {
      label: 'Pending Follow-ups',
      value: pendingFollowUps ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      color: 'text-warning',
      bg: 'bg-warning-light',
    },
    {
      label: 'No-Shows This Month',
      value: noShows ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      color: 'text-danger',
      bg: 'bg-danger-light',
    },
    {
      label: 'Pending Reminders',
      value: pendingReminders ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      ),
      color: 'text-success',
      bg: 'bg-success-light',
    },
  ];

  const reminders: ReminderWithClient[] = upcomingReminders ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          Upcoming Reminders
        </h2>
        {reminders.length > 0 ? (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border/50"
              >
                <div className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{reminder.message}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {(Array.isArray(reminder.clients)
                      ? reminder.clients[0]?.name
                      : reminder.clients?.name) ?? 'Unknown client'}{' '}
                    ·{' '}
                    {new Date(reminder.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-sm">No pending reminders</p>
            <p className="text-xs mt-1">Add reminders from the Reminders page</p>
          </div>
        )}
      </div>
    </div>
  );
}
