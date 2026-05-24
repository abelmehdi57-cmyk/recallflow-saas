# RecallFlow Phase 2 — Implementation Guide

## 1. Run the database migration (required)

In **Supabase → SQL Editor**, paste and run the full file:

`supabase/migrations/20250520_phase2_product.sql`

This adds:

- `businesses`: `currency`, `timezone`, `business_type`, `default_appointment_value`
- `appointments`: `status` (pending | confirmed | completed | cancelled | no-show), `amount`
- Backfill from legacy `confirmed` / `showed_up` columns

Fresh installs: `supabase/schema.sql` already includes these columns.

## 2. Configure business settings

**Dashboard → Settings**

- Currency (lost revenue + completed appointment amounts)
- Timezone (date displays)
- Business type
- Default appointment value (no-show / lost revenue estimate)

## 3. What shipped

### Dashboard

| Feature | Location |
|---------|----------|
| Estimated lost revenue | `components/dashboard/lost-revenue-widget.tsx` |
| Upcoming appointments | `components/dashboard/upcoming-appointments.tsx` |
| Reminder urgency | `components/dashboard/reminders-urgency-list.tsx` |
| Weekly trend chart | `components/dashboard/weekly-trend-chart.tsx` |
| Appointment analytics | `components/dashboard/appointment-analytics.tsx` |
| Data layer | `lib/dashboard/get-dashboard-data.ts` |

### Clients

| Feature | Location |
|---------|----------|
| Search / filter / sort | `components/clients/client-list-toolbar.tsx` |
| Client profile + revenue + history | `app/dashboard/clients/[id]/page.tsx` |

### Appointments

| Feature | Location |
|---------|----------|
| Status system | `lib/appointments/status.ts`, `components/appointments/status-badge.tsx` |
| Revenue on completed | Appointments form + table |

### Reminders

| Feature | Location |
|---------|----------|
| Quick presets | `lib/reminders/presets.ts` |
| Overdue / due today badges | `lib/reminders/urgency.ts` |

### Settings

| Feature | Location |
|---------|----------|
| Currency, timezone, business type | `app/dashboard/settings/page.tsx` |
| Constants | `lib/constants/business.ts` |

## 4. Architecture notes

- **Multi-tenant**: All queries scoped by `business_id`; RLS unchanged.
- **Hooks**: `useBusinessProfile` loads full business row; `useBusiness` re-exports for compatibility.
- **Legacy appointments**: If `status` is null (pre-migration), `legacyToStatus()` derives it from booleans.

## 5. Manual test checklist

1. Run migration → refresh dashboard (widgets load).
2. Settings: set currency + default value → save.
3. Create appointment → set status **Completed** → enter amount.
4. Mark another past appointment **No-show** → lost revenue widget updates.
5. Clients: search, filter, open profile → see revenue + history.
6. Reminders: use preset → confirm overdue badge on past due items.
