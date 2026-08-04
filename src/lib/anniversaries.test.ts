import { describe, expect, it } from 'vitest'
import {
  dateOnMonthDay,
  groupByRollingMonths,
  upcomingYearsOfService,
  type EmployeeRow,
} from './anniversaries'

describe('upcomingYearsOfService', () => {
  it('uses this year’s anniversary when it is still ahead', () => {
    // Hire 2011-04-10, as of 2026-07-31 → next anniv 2027-04-10 → 16 years
    const service = new Date(2011, 3, 10)
    const asOf = new Date(2026, 6, 31)
    expect(upcomingYearsOfService(service, asOf)).toBe(16)
  })

  it('rolls to next year when anniversary already passed', () => {
    // Hire 2022-03-05, as of 2026-07-31 → next anniv 2027-03-05 → 5 years
    const service = new Date(2022, 2, 5)
    const asOf = new Date(2026, 6, 31)
    expect(upcomingYearsOfService(service, asOf)).toBe(5)
  })

  it('counts anniversary day itself as this year’s anniversary', () => {
    const service = new Date(2019, 6, 31)
    const asOf = new Date(2026, 6, 31)
    expect(upcomingYearsOfService(service, asOf)).toBe(7)
  })

  it('handles first anniversary for recent hires', () => {
    const service = new Date(2024, 10, 3)
    const asOf = new Date(2026, 6, 31)
    expect(upcomingYearsOfService(service, asOf)).toBe(2)
  })

  it('maps Feb 29 service dates to Feb 28 in non-leap years', () => {
    const service = new Date(2020, 1, 29)
    // 2027 is not a leap year; as of 2026-03-01 → next is 2027-02-28 → 7 years
    const asOf = new Date(2026, 2, 1)
    expect(upcomingYearsOfService(service, asOf)).toBe(7)
    expect(dateOnMonthDay(2027, 1, 29)).toEqual(new Date(2027, 1, 28))
  })
})

describe('groupByRollingMonths', () => {
  const rows: EmployeeRow[] = [
    {
      employeeName: 'Zebra,Ann',
      serviceDate: new Date(2020, 7, 5),
      managerName: 'Mgr A',
    },
    {
      employeeName: 'Alpha,Bob',
      serviceDate: new Date(2018, 7, 5),
      managerName: 'Mgr B',
    },
    {
      employeeName: 'Middle,Chris',
      serviceDate: new Date(2019, 7, 12),
      managerName: 'Mgr C',
    },
    {
      employeeName: 'Sept,Person',
      serviceDate: new Date(2015, 8, 1),
      managerName: 'Mgr D',
    },
  ]

  it('orders months rolling from today and marks current month', () => {
    const asOf = new Date(2026, 7, 4) // August
    const groups = groupByRollingMonths(rows, asOf)

    expect(groups).toHaveLength(12)
    expect(groups[0].month).toBe('August')
    expect(groups[0].isCurrentMonth).toBe(true)
    expect(groups[1].month).toBe('September')
    expect(groups[11].month).toBe('July')
    expect(groups.filter((g) => g.isCurrentMonth)).toHaveLength(1)
  })

  it('sorts within a month by day then name', () => {
    const asOf = new Date(2026, 7, 4)
    const groups = groupByRollingMonths(rows, asOf)
    const august = groups[0]

    expect(august.anniversaries.map((a) => a.employeeName)).toEqual([
      'Alpha,Bob',
      'Zebra,Ann',
      'Middle,Chris',
    ])
    expect(august.anniversaries.map((a) => a.upcomingYearsOfService)).toEqual([
      8, 6, 7,
    ])
  })
})
