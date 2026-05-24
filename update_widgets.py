import re

def update_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)


# appointment-analytics
update_file("/Users/mac/Documents/first saas /recallflow/src/components/dashboard/appointment-analytics.tsx", [
    ("import { APPOINTMENT_STATUS_STYLES, getAppointmentStatusLabel } from '@/lib/appointments/status';", "import { getAppointmentStatusLabel } from '@/lib/appointments/status';\nimport { useTranslations } from 'next-intl';"),
    ("export function AppointmentAnalytics({ statusCounts, total }: AppointmentAnalyticsProps) {", "export function AppointmentAnalytics({ statusCounts, total }: AppointmentAnalyticsProps) {\n  const t = useTranslations('DashboardWidgets.AppointmentAnalytics');"),
    ("Appointment analytics", "{t('title')}"),
    ("{total} total in the last 30 days", "{t('subtitle', { total })}")
])

# lost-revenue-widget
update_file("/Users/mac/Documents/first saas /recallflow/src/components/dashboard/lost-revenue-widget.tsx", [
    ("import { formatMoney } from '@/lib/format/currency';", "import { formatMoney } from '@/lib/format/currency';\nimport { useTranslations } from 'next-intl';"),
    ("export function LostRevenueWidget({ amount, noShowCount, currency }: LostRevenueWidgetProps) {", "export function LostRevenueWidget({ amount, noShowCount, currency }: LostRevenueWidgetProps) {\n  const t = useTranslations('DashboardWidgets.LostRevenueWidget');"),
    ("right-0", "end-0"),
    ("translate-x-1/2", "translate-x-1/2 rtl:-translate-x-1/2"),
    ("Estimated lost revenue (no-shows)", "{t('title')}"),
    ("{noShowCount} no-show{noShowCount === 1 ? '' : 's'} this month", "{t('subtitle', { count: noShowCount })}"),
    ("Review appointments →", "{t('link')}")
])

# reminders-urgency-list
update_file("/Users/mac/Documents/first saas /recallflow/src/components/dashboard/reminders-urgency-list.tsx", [
    ("import type { ReminderWithClient } from '@/lib/supabase/types';", "import type { ReminderWithClient } from '@/lib/supabase/types';\nimport { useTranslations, useLocale } from 'next-intl';"),
    ("export function RemindersUrgencyList({ reminders, timezone }: RemindersUrgencyListProps) {", "export function RemindersUrgencyList({ reminders, timezone }: RemindersUrgencyListProps) {\n  const t = useTranslations('DashboardWidgets.RemindersUrgencyList');\n  const locale = useLocale();"),
    ("function clientName(reminder: ReminderWithClient): string {", "function clientName(reminder: ReminderWithClient, t: any): string {"),
    ("'Unknown client'", "t('unknownClient')"),
    ("clientName(reminder)", "clientName(reminder, t)"),
    ("Reminders", "{t('title')}"),
    ("View all", "{t('viewAll')}"),
    ("No pending reminders.", "{t('empty')}"),
    ("Add one", "{t('addOne')}"),
    ("'en-US'", "locale")
])

# upcoming-appointments
update_file("/Users/mac/Documents/first saas /recallflow/src/components/dashboard/upcoming-appointments.tsx", [
    ("import type { AppointmentStatus } from '@/lib/supabase/types';", "import type { AppointmentStatus } from '@/lib/supabase/types';\nimport { useTranslations, useLocale } from 'next-intl';"),
    ("export function UpcomingAppointments({ appointments, timezone }: UpcomingAppointmentsProps) {", "export function UpcomingAppointments({ appointments, timezone }: UpcomingAppointmentsProps) {\n  const t = useTranslations('DashboardWidgets.UpcomingAppointments');\n  const locale = useLocale();"),
    ("function formatDate(iso: string, timezone?: string) {", "function formatDate(iso: string, locale: string, timezone?: string) {"),
    ("'en-US'", "locale"),
    ("formatDate(apt.date, timezone)", "formatDate(apt.date, locale, timezone)"),
    ("Upcoming appointments", "{t('title')}"),
    ("View all", "{t('viewAll')}"),
    ("No upcoming appointments.", "{t('empty')}"),
    ("Schedule one", "{t('scheduleOne')}")
])

# weekly-trend-chart
update_file("/Users/mac/Documents/first saas /recallflow/src/components/dashboard/weekly-trend-chart.tsx", [
    ("import type { WeeklyPoint } from '@/lib/dashboard/analytics';", "import type { WeeklyPoint } from '@/lib/dashboard/analytics';\nimport { useTranslations } from 'next-intl';"),
    ("export function WeeklyTrendChart({ data, title = 'Appointments this week' }: WeeklyTrendChartProps) {", "export function WeeklyTrendChart({ data, title }: WeeklyTrendChartProps) {\n  const t = useTranslations('DashboardWidgets.WeeklyTrendChart');\n  const finalTitle = title ?? t('title');"),
    ("{title}", "{finalTitle}")
])

print("Done widgets")
