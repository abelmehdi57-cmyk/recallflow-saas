import {
  APPOINTMENT_STATUS_STYLES,
  getAppointmentStatusLabel,
} from '@/lib/appointments/status';
import type { AppointmentStatus } from '@/lib/supabase/types';

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${APPOINTMENT_STATUS_STYLES[status]}`}
    >
      {getAppointmentStatusLabel(status)}
    </span>
  );
}
