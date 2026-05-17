export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfTomorrow(from: Date = startOfToday()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  return d;
}

export function startOfMonth(from: Date = new Date()): Date {
  return new Date(from.getFullYear(), from.getMonth(), 1);
}
