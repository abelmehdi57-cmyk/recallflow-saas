export type ReminderPreset = {
  id: string;
  label: string;
  message: string;
  /** Hours from now for due date */
  hoursFromNow: number;
};

export const REMINDER_PRESETS: ReminderPreset[] = [
  {
    id: 'follow-up-24h',
    label: 'Follow up in 24h',
    message: 'Check in — how was your visit? Book your next appointment if you’d like.',
    hoursFromNow: 24,
  },
  {
    id: 'appointment-24h',
    label: 'Appointment reminder (24h)',
    message: 'Reminder: you have an appointment tomorrow. Reply to confirm or reschedule.',
    hoursFromNow: 24,
  },
  {
    id: 'payment',
    label: 'Payment follow-up',
    message: 'Friendly reminder about your outstanding balance. Let us know if you have questions.',
    hoursFromNow: 48,
  },
  {
    id: 'rebook',
    label: 'Rebook nudge',
    message: 'It’s been a while — would you like to schedule your next visit?',
    hoursFromNow: 72,
  },
];

export function dueDateFromPresetHours(hoursFromNow: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  return d.toISOString();
}
