import type { AppointmentStatus } from '@/lib/supabase/types';
import { startOfToday } from '@/lib/dashboard/dates';

export type WeeklyPoint = { label: string; count: number; dateKey: string };

export type StatusCount = { status: AppointmentStatus; count: number };

export function buildWeeklyTrend(
  appointments: { date: string }[],
  days = 7,
): WeeklyPoint[] {
  const today = startOfToday();
  const points: WeeklyPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const count = appointments.filter((a) => {
      const ad = new Date(a.date);
      return ad >= d && ad < next;
    }).length;

    points.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      count,
      dateKey: d.toISOString().slice(0, 10),
    });
  }

  return points;
}

export function countByStatus(
  appointments: { status: AppointmentStatus }[],
): StatusCount[] {
  const statuses: AppointmentStatus[] = [
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'no-show',
  ];

  return statuses.map((status) => ({
    status,
    count: appointments.filter((a) => a.status === status).length,
  }));
}

export function estimateLostRevenue(
  noShowCount: number,
  defaultValue: number,
  noShowAmounts: number[],
): number {
  if (noShowAmounts.length > 0) {
    return noShowAmounts.reduce((sum, a) => sum + (a || defaultValue), 0);
  }
  return noShowCount * defaultValue;
}
