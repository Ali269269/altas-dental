const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseAnchor(anchor: string): Date {
  const [y, m, d] = anchor.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatAppointmentDateLabels(anchor: string) {
  const date = parseAnchor(anchor);
  const weekStart = startOfWeekMonday(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const month = formatMonthYear(date);
  const week =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${MONTHS_FULL[weekStart.getMonth()]} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`
      : `${MONTHS_FULL[weekStart.getMonth()]} ${weekStart.getDate()} - ${MONTHS_FULL[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
  const day = `${MONTHS_FULL[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  return { month, week, day };
}

function formatMonthYear(date: Date) {
  return `${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`;
}

export function getTodayAnchorDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
