export type EmployeeRow = {
  employeeName: string
  /** Original hire / service date from the export. */
  serviceDate: Date
  managerName: string
}

/**
 * One person after anniversary math.
 * `serviceDate` is the hire date (month/day of their annual anniversary).
 */
export type Anniversary = EmployeeRow & {
  yearsOfServiceThisYear: number
  anniversaryMonth: string
  dayOfMonth: number
}

export type MonthGroup = {
  month: string
  monthIndex: number
  isCurrentMonth: boolean
  anniversaries: Anniversary[]
}

/** Product milestone year for the dedicated cohort section. */
export const FIFTEEN_YEAR_MILESTONE = 15

export type AnniversaryResults = {
  groups: MonthGroup[]
  fifteenYearCohort: Anniversary[]
  asOf: Date
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

/** Build a date on month/day in year; Feb 29 → Feb 28 in non-leap years. */
export function dateOnMonthDay(
  year: number,
  monthIndex: number,
  day: number,
): Date {
  if (monthIndex === 1 && day === 29) {
    const leap = new Date(year, 1, 29)
    if (leap.getMonth() !== 1) {
      return new Date(year, 1, 28)
    }
  }
  return new Date(year, monthIndex, day)
}

/**
 * Years of service for the anniversary falling in the as-of calendar year.
 * Years = asOfYear − hireYear (same before and after anniversary day).
 */
export function yearsOfServiceThisYear(
  serviceDate: Date,
  asOf: Date,
): number {
  return asOf.getFullYear() - serviceDate.getFullYear()
}

export function toAnniversary(row: EmployeeRow, asOf: Date): Anniversary {
  const monthIndex = row.serviceDate.getMonth()
  return {
    ...row,
    yearsOfServiceThisYear: yearsOfServiceThisYear(row.serviceDate, asOf),
    anniversaryMonth: MONTH_NAMES[monthIndex],
    dayOfMonth: row.serviceDate.getDate(),
  }
}

/** Calendar year month indices: January (0) through December (11). */
export function calendarMonthOrder(): number[] {
  return Array.from({ length: 12 }, (_, i) => i)
}

function compareNames(a: Anniversary, b: Anniversary): number {
  return a.employeeName.localeCompare(b.employeeName, undefined, {
    sensitivity: 'base',
  })
}

/** Within a single month: day of month, then name. */
function compareAnniversaries(a: Anniversary, b: Anniversary): number {
  if (a.dayOfMonth !== b.dayOfMonth) {
    return a.dayOfMonth - b.dayOfMonth
  }
  return compareNames(a, b)
}

/** Full calendar year: month, then day, then name. */
function compareAnniversariesByCalendarDate(
  a: Anniversary,
  b: Anniversary,
): number {
  const monthDiff = a.serviceDate.getMonth() - b.serviceDate.getMonth()
  if (monthDiff !== 0) {
    return monthDiff
  }
  return compareAnniversaries(a, b)
}

/**
 * True when the person's Nth anniversary falls in the as-of calendar year
 * (hire year + years === asOf year). Stays true through Dec 31 of that year.
 */
export function isCalendarYearMilestone(
  serviceDate: Date,
  asOf: Date,
  years: number,
): boolean {
  return serviceDate.getFullYear() + years === asOf.getFullYear()
}

/**
 * People whose N-year anniversary lands in the as-of calendar year.
 * `yearsOfServiceThisYear` stays N through Dec 31.
 */
export function calendarYearMilestoneCohort(
  rows: EmployeeRow[],
  asOf: Date,
  years: number,
): Anniversary[] {
  return rows
    .filter((row) => isCalendarYearMilestone(row.serviceDate, asOf, years))
    .map((row) => toAnniversary(row, asOf))
    .sort(compareAnniversariesByCalendarDate)
}

/** Group people by anniversary month for the as-of calendar year (Jan–Dec). */
export function groupByCalendarMonths(
  rows: EmployeeRow[],
  asOf: Date = new Date(),
): MonthGroup[] {
  const anniversaries = rows.map((row) => toAnniversary(row, asOf))
  const order = calendarMonthOrder()
  const currentMonth = asOf.getMonth()

  return order.map((monthIndex) => {
    const month = MONTH_NAMES[monthIndex]
    const inMonth = anniversaries
      .filter((a) => a.serviceDate.getMonth() === monthIndex)
      .sort(compareAnniversaries)

    return {
      month,
      monthIndex,
      isCurrentMonth: monthIndex === currentMonth,
      anniversaries: inMonth,
    }
  })
}

/** Compose month groups + product 15-year cohort from employee rows. */
export function buildAnniversaryResults(
  rows: EmployeeRow[],
  asOf: Date = new Date(),
): AnniversaryResults {
  return {
    groups: groupByCalendarMonths(rows, asOf),
    fifteenYearCohort: calendarYearMilestoneCohort(
      rows,
      asOf,
      FIFTEEN_YEAR_MILESTONE,
    ),
    asOf,
  }
}

export { MONTH_NAMES }
export { startOfLocalDay } from './dates'
