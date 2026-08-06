import { describe, expect, it } from 'vitest'
import {
  buildAnniversaryResults,
  calendarYearMilestoneCohort,
  dateOnMonthDay,
  FIFTEEN_YEAR_MILESTONE,
  groupByRollingMonths,
  isCalendarYearMilestone,
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

describe('isCalendarYearMilestone', () => {
  it('is true when hire year + milestone equals asOf year', () => {
    const service = new Date(2011, 10, 15)
    const asOf = new Date(2026, 5, 1)
    expect(isCalendarYearMilestone(service, asOf, 15)).toBe(true)
  })

  it('is false for adjacent years', () => {
    const service = new Date(2011, 10, 15)
    expect(isCalendarYearMilestone(service, new Date(2025, 5, 1), 15)).toBe(
      false,
    )
    expect(isCalendarYearMilestone(service, new Date(2027, 0, 1), 15)).toBe(
      false,
    )
  })

  it('works for milestones other than 15', () => {
    const service = new Date(2016, 2, 1)
    expect(isCalendarYearMilestone(service, new Date(2026, 0, 1), 10)).toBe(
      true,
    )
    expect(isCalendarYearMilestone(service, new Date(2026, 0, 1), 15)).toBe(
      false,
    )
  })
})

describe('calendarYearMilestoneCohort', () => {
  const rows: EmployeeRow[] = [
    {
      employeeName: 'Zebra,Zed',
      serviceDate: new Date(2011, 2, 10), // Mar 10 → 15 in 2026
      managerName: 'Mgr Z',
    },
    {
      employeeName: 'Alpha,Ann',
      serviceDate: new Date(2011, 10, 5), // Nov 5 → 15 in 2026
      managerName: 'Mgr A',
    },
    {
      employeeName: 'Beta,Bob',
      serviceDate: new Date(2011, 10, 5), // same day, name after Alpha
      managerName: 'Mgr B',
    },
    {
      employeeName: 'Other,Yos',
      serviceDate: new Date(2012, 5, 1), // 14 in 2026
      managerName: 'Mgr O',
    },
    {
      employeeName: 'Past,Pat',
      serviceDate: new Date(2010, 5, 1), // 16 in 2026
      managerName: 'Mgr P',
    },
  ]

  it('includes future months later the same calendar year', () => {
    const asOf = new Date(2026, 5, 1) // June
    const cohort = calendarYearMilestoneCohort(rows, asOf, 15)
    expect(cohort.map((a) => a.employeeName)).toContain('Alpha,Ann')
    expect(cohort.map((a) => a.employeeName)).toContain('Zebra,Zed')
  })

  it('keeps members after anniversary day with truthful upcoming YOS', () => {
    const asOf = new Date(2026, 7, 1) // August — March 15th already passed
    const cohort = calendarYearMilestoneCohort(rows, asOf, 15)
    const zebra = cohort.find((a) => a.employeeName === 'Zebra,Zed')
    expect(zebra).toBeDefined()
    expect(zebra!.upcomingYearsOfService).toBe(16)
  })

  it('excludes non-members and drops prior cohort next calendar year', () => {
    const asOf = new Date(2026, 5, 1)
    const cohort = calendarYearMilestoneCohort(rows, asOf, 15)
    const names2026 = cohort.map((a) => a.employeeName)
    expect(names2026).not.toContain('Other,Yos')
    expect(names2026).not.toContain('Past,Pat')

    const nextYear = calendarYearMilestoneCohort(
      rows,
      new Date(2027, 0, 1),
      15,
    )
    // 2011 hires are off the list; 2012 hire (Other) turns 15 in 2027
    expect(nextYear.map((a) => a.employeeName)).toEqual(['Other,Yos'])
    expect(names2026).toContain('Zebra,Zed')
    expect(nextYear.map((a) => a.employeeName)).not.toContain('Zebra,Zed')
  })

  it('returns empty when none match', () => {
    const onlyOther: EmployeeRow[] = [
      {
        employeeName: 'Other,Yos',
        serviceDate: new Date(2012, 5, 1),
        managerName: 'Mgr O',
      },
    ]
    expect(
      calendarYearMilestoneCohort(onlyOther, new Date(2026, 5, 1), 15),
    ).toEqual([])
  })

  it('sorts by calendar month, day, then name', () => {
    const asOf = new Date(2026, 5, 1)
    const cohort = calendarYearMilestoneCohort(rows, asOf, 15)
    expect(cohort.map((a) => a.employeeName)).toEqual([
      'Zebra,Zed',
      'Alpha,Ann',
      'Beta,Bob',
    ])
  })
})

describe('buildAnniversaryResults', () => {
  it('returns month groups and fifteen-year cohort together', () => {
    const rows: EmployeeRow[] = [
      {
        employeeName: 'Milestone,M',
        serviceDate: new Date(2011, 10, 1),
        managerName: 'Mgr',
      },
      {
        employeeName: 'Regular,R',
        serviceDate: new Date(2020, 7, 4),
        managerName: 'Mgr',
      },
    ]
    const asOf = new Date(2026, 7, 4)
    const results = buildAnniversaryResults(rows, asOf)

    expect(results.asOf).toBe(asOf)
    expect(results.groups).toHaveLength(12)
    expect(results.fifteenYearCohort).toHaveLength(1)
    expect(results.fifteenYearCohort[0].employeeName).toBe('Milestone,M')
    expect(FIFTEEN_YEAR_MILESTONE).toBe(15)

    const november = results.groups.find((g) => g.month === 'November')
    expect(
      november?.anniversaries.some((a) => a.employeeName === 'Milestone,M'),
    ).toBe(true)
  })
})
