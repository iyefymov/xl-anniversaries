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
export type Anniversary = {
  employeeName: string
  serviceDate: Date
  managerName: string
  upcomingYearsOfService: number
  anniversaryMonth: string
  dayOfMonth: number
}

export type MonthGroup = {
  month: string
  monthIndex: number
  isCurrentMonth: boolean
  anniversaries: Anniversary[]
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

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

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
 * Full years of service on the next anniversary on or after `asOf`.
 * Years = anniversaryYear − serviceYear.
 */
export function upcomingYearsOfService(serviceDate: Date, asOf: Date): number {
  const today = startOfLocalDay(asOf)
  const month = serviceDate.getMonth()
  const day = serviceDate.getDate()

  let nextAnniversary = dateOnMonthDay(today.getFullYear(), month, day)
  if (nextAnniversary < today) {
    nextAnniversary = dateOnMonthDay(today.getFullYear() + 1, month, day)
  }

  return nextAnniversary.getFullYear() - serviceDate.getFullYear()
}

export function toAnniversary(row: EmployeeRow, asOf: Date): Anniversary {
  const monthIndex = row.serviceDate.getMonth()
  return {
    employeeName: row.employeeName,
    serviceDate: row.serviceDate,
    managerName: row.managerName,
    upcomingYearsOfService: upcomingYearsOfService(row.serviceDate, asOf),
    anniversaryMonth: MONTH_NAMES[monthIndex],
    dayOfMonth: row.serviceDate.getDate(),
  }
}

export function rollingMonthOrder(asOf: Date): number[] {
  const start = asOf.getMonth()
  return Array.from({ length: 12 }, (_, i) => (start + i) % 12)
}

function compareAnniversaries(a: Anniversary, b: Anniversary): number {
  if (a.dayOfMonth !== b.dayOfMonth) {
    return a.dayOfMonth - b.dayOfMonth
  }
  return a.employeeName.localeCompare(b.employeeName, undefined, {
    sensitivity: 'base',
  })
}

export function groupByRollingMonths(
  rows: EmployeeRow[],
  asOf: Date = new Date(),
): MonthGroup[] {
  const anniversaries = rows.map((row) => toAnniversary(row, asOf))
  const order = rollingMonthOrder(asOf)
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

/** Display format for service/anniversary dates (e.g. Sep 8, 2025). */
export function formatServiceDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatReferenceDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export { MONTH_NAMES }
