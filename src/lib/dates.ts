/** Drop time-of-day; keep Y/M/D as a local calendar date. */
export function toLocalCalendarDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Alias for "as of" comparisons that ignore wall-clock time. */
export const startOfLocalDay = toLocalCalendarDate
