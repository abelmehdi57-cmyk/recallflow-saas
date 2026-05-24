import { legacyToStatus } from '@/lib/appointments/status';
import type { Appointment, AppointmentStatus } from '@/lib/supabase/types';

export function normalizeAppointmentStatus(row: {
  status?: AppointmentStatus | null;
  confirmed?: boolean;
  showed_up?: boolean;
  date: string;
}): AppointmentStatus {
  if (row.status) return row.status;
  return legacyToStatus(row.confirmed ?? false, row.showed_up ?? false, row.date);
}

export function parseAppointment(row: Appointment): Appointment {
  return {
    ...row,
    status: normalizeAppointmentStatus(row),
    amount: row.amount != null ? Number(row.amount) : null,
  };
}
