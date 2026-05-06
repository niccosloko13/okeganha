const PT_BR = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
});

export function formatDate(date: Date): string {
  return PT_BR.format(date);
}

export function getStartOfDay(date = new Date()): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getEndOfDay(date = new Date()): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function getWeekBounds(date = new Date()): { start: Date; end: Date } {
  const reference = new Date(date);
  const day = reference.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(reference);
  start.setDate(reference.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function getNextWithdrawalDate(date = new Date()): Date {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day <= 5 ? 5 - day  : 12 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(9, 0, 0, 0);
  return next;
}

export function isSameWeekday(date: Date, weekday: number): boolean {
  return date.getDay() === weekday;
}

