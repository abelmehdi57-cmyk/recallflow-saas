export type ReminderUrgency = 'overdue' | 'today' | 'soon' | 'later';

export function getReminderUrgency(dueIso: string, done: boolean): ReminderUrgency {
  if (done) return 'later';

  const due = new Date(dueIso);
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  if (due < startOfToday) return 'overdue';
  if (due < endOfToday) return 'today';

  const in48h = new Date(now);
  in48h.setHours(in48h.getHours() + 48);
  if (due <= in48h) return 'soon';

  return 'later';
}

export const URGENCY_STYLES: Record<ReminderUrgency, { dot: string; badge: string; label: string }> = {
  overdue: {
    dot: 'bg-danger',
    badge: 'bg-danger-light text-danger border-danger/25',
    label: 'Overdue',
  },
  today: {
    dot: 'bg-warning',
    badge: 'bg-warning-light text-warning border-warning/25',
    label: 'Due today',
  },
  soon: {
    dot: 'bg-primary',
    badge: 'bg-primary/15 text-primary border-primary/25',
    label: 'Due soon',
  },
  later: {
    dot: 'bg-muted',
    badge: 'bg-foreground/10 text-muted border-border',
    label: 'Upcoming',
  },
};
