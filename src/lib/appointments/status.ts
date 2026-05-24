import type { AppointmentStatus } from '@/lib/supabase/types';

export const APPOINTMENT_STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No-show' },
];

export const APPOINTMENT_STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: 'bg-foreground/10 text-muted border-border',
  confirmed: 'bg-primary/15 text-primary border-primary/25',
  completed: 'bg-success-light text-success border-success/25',
  cancelled: 'bg-foreground/10 text-muted border-border line-through',
  'no-show': 'bg-danger-light text-danger border-danger/25',
};

export function getAppointmentStatusLabel(status: AppointmentStatus): string {
  return APPOINTMENT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

/** Map legacy booleans when status column is missing (pre-migration). */
export function legacyToStatus(
  confirmed: boolean,
  showedUp: boolean,
  dateIso: string,
): AppointmentStatus {
  if (showedUp) return 'completed';
  if (confirmed && !showedUp && new Date(dateIso) < new Date()) return 'no-show';
  if (confirmed) return 'confirmed';
  return 'pending';
}
