import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildWeeklyTrend,
  countByStatus,
  estimateLostRevenue,
  type StatusCount,
  type WeeklyPoint,
} from '@/lib/dashboard/analytics';
import { startOfMonth, startOfToday, startOfTomorrow } from '@/lib/dashboard/dates';
import { legacyToStatus } from '@/lib/appointments/status';
import type {
  AppointmentStatus,
  BusinessProfile,
  ReminderWithClient,
} from '@/lib/supabase/types';
import type { UpcomingAppointmentRow } from '@/components/dashboard/upcoming-appointments';

export type DashboardData = {
  business: BusinessProfile;
  stats: {
    todayAppointments: number;
    pendingFollowUps: number;
    noShowsMonth: number;
    pendingReminders: number;
  };
  lostRevenue: number;
  upcomingAppointments: UpcomingAppointmentRow[];
  reminders: ReminderWithClient[];
  weeklyTrend: WeeklyPoint[];
  statusCounts: StatusCount[];
  appointmentsLast30Total: number;
};

function normalizeStatus(row: {
  status?: AppointmentStatus | null;
  confirmed?: boolean;
  showed_up?: boolean;
  date: string;
}): AppointmentStatus {
  if (row.status) return row.status;
  return legacyToStatus(row.confirmed ?? false, row.showed_up ?? false, row.date);
}

export async function getDashboardData(
  supabase: SupabaseClient,
  businessId: string,
): Promise<DashboardData | null> {
  const { data: businessRow, error: bizError } = await supabase
    .from('businesses')
    .select(
      'id, business_name, currency, language, timezone, business_type, default_appointment_value',
    )
    .eq('id', businessId)
    .single();

  if (bizError || !businessRow) return null;

  const business: BusinessProfile = {
    id: businessRow.id,
    business_name: businessRow.business_name,
    currency: businessRow.currency ?? 'USD',
    language: businessRow.language ?? 'en',
    timezone: businessRow.timezone ?? 'UTC',
    business_type: businessRow.business_type ?? 'general',
    default_appointment_value: Number(businessRow.default_appointment_value ?? 75),
  };

  const today = startOfToday();
  const tomorrow = startOfTomorrow(today);
  const firstOfMonth = startOfMonth(today);
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const [
    { count: todayAppointments },
    { count: pendingFollowUps },
    { data: monthAppointments },
    { count: pendingReminders },
    { data: upcomingReminders },
    { data: upcomingApts },
    { data: weekApts },
    { data: last30Apts },
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
      .select('status, amount, confirmed, showed_up, date')
      .eq('business_id', businessId)
      .gte('date', firstOfMonth.toISOString())
      .lt('date', now.toISOString()),
    supabase
      .from('reminders')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('done', false),
    supabase
      .from('reminders')
      .select('id, message, date, done, clients(name)')
      .eq('business_id', businessId)
      .eq('done', false)
      .order('date', { ascending: true })
      .limit(5),
    supabase
      .from('appointments')
      .select('id, date, status, confirmed, showed_up, clients(name)')
      .eq('business_id', businessId)
      .gte('date', now.toISOString())
      .order('date', { ascending: true })
      .limit(5),
    supabase
      .from('appointments')
      .select('date')
      .eq('business_id', businessId)
      .gte('date', weekAgo.toISOString()),
    supabase
      .from('appointments')
      .select('status, confirmed, showed_up, date')
      .eq('business_id', businessId)
      .gte('date', thirtyDaysAgo.toISOString()),
  ]);

  const normalizedMonth = (monthAppointments ?? []).map((a) => ({
    ...a,
    status: normalizeStatus(a),
  }));

  const noShows = normalizedMonth.filter((a) => a.status === 'no-show');
  const noShowAmounts = noShows.map(
    (a) => Number(a.amount) || business.default_appointment_value,
  );

  const lostRevenue = estimateLostRevenue(
    noShows.length,
    business.default_appointment_value,
    noShowAmounts,
  );

  const upcomingAppointments: UpcomingAppointmentRow[] = (upcomingApts ?? []).map((a) => {
    const clients = a.clients as { name: string } | { name: string }[] | null;
    const name = Array.isArray(clients)
      ? clients[0]?.name
      : clients?.name;
    return {
      id: a.id,
      date: a.date,
      status: normalizeStatus(a),
      clientName: name ?? 'Unknown client',
    };
  });

  const weeklyTrend = buildWeeklyTrend(weekApts ?? [], 7);

  const normalized30 = (last30Apts ?? []).map((a) => ({
    status: normalizeStatus(a),
  }));
  const statusCounts = countByStatus(normalized30);

  return {
    business,
    stats: {
      todayAppointments: todayAppointments ?? 0,
      pendingFollowUps: pendingFollowUps ?? 0,
      noShowsMonth: noShows.length,
      pendingReminders: pendingReminders ?? 0,
    },
    lostRevenue,
    upcomingAppointments,
    reminders: (upcomingReminders ?? []) as ReminderWithClient[],
    weeklyTrend,
    statusCounts,
    appointmentsLast30Total: normalized30.length,
  };
}
