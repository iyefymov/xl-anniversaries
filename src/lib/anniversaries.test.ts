import { describe, expect, it } from 'vitest'
import {
  buildAnniversaryResults,
  calendarYearMilestoneCohort,
  dateOnMonthDay,
  FIFTEEN_YEAR_MILESTONE,
  groupByCalendarMonths,
  isCalendarYearMilestone,
  yearsOfServiceThisYear,
  type EmployeeRow,
} from './anniversaries'

describe('yearsOfServiceThisYear', () => {
  it('is asOf year minus hire year regardless of month', () => {
    // Hire 2011-04-10, as of 2026-07-31 → 15 years (calendar year anniversary)
    const service = new Date(2011, 3, 10)
    const asOf = new Date(2026, 6, 31)
    expect(yearsOfServiceThisYear(service, asOf)).toBe(15)
  })

  it('does not advance after anniversary day has passed', () => {
    // Hire 2022-03-05, as of 2026-07-31 → still 4 for calendar year 2026
    const service = new Date(2022, 2, 5)
    const asOf = new Date(2026, 6, 31)
    expect(yearsOfServiceThisYear(service, asOf)).toBe(4)
  })

  it('uses the same N for days before and after anniversary in the same year', () => {
    const serviceBefore = new Date(2025, 7, 5) // Aug 5
    const serviceAfter = new Date(2025, 7, 7) // Aug 7
    const asOf = new Date(2026, 7, 6) // Aug 6
    expect(yearsOfServiceThisYear(serviceBefore, asOf)).toBe(1)
    expect(yearsOfServiceThisYear(serviceAfter, asOf)).toBe(1)
  })

  it('handles first anniversary year for recent hires', () => {
    const service = new Date(2024, 10, 3)
    const asOf = new Date(2026, 6, 31)
    expect(yearsOfServiceThisYear(service, asOf)).toBe(2)
  })

  it('shows 0 for same-calendar-year hires', () => {
    const service = new Date(2026, 2, 15)
    const asOf = new Date(2026, 7, 6)
    expect(yearsOfServiceThisYear(service, asOf)).toBe(0)
  })

  it('keeps dateOnMonthDay Feb 29 mapping for non-leap years', () => {
    expect(dateOnMonthDay(2027, 1, 29)).toEqual(new Date(2027, 1, 28))
  })
})

describe('groupByCalendarMonths', () => {
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

  it('orders months January through December and marks current month', () => {
    const asOf = new Date(2026, 7, 4) // August
    const groups = groupByCalendarMonths(rows, asOf)

    expect(groups).toHaveLength(12)
    expect(groups[0].month).toBe('January')
    expect(groups[7].month).toBe('August')
    expect(groups[7].isCurrentMonth).toBe(true)
    expect(groups[11].month).toBe('December')
    expect(groups.filter((g) => g.isCurrentMonth)).toHaveLength(1)
  })

  it('includes empty months', () => {
    const asOf = new Date(2026, 7, 4)
    const groups = groupByCalendarMonths(rows, asOf)
    expect(groups[0].anniversaries).toEqual([])
    expect(groups[0].month).toBe('January')
  })

  it('sorts within a month by day then name', () => {
    const asOf = new Date(2026, 7, 4)
    const groups = groupByCalendarMonths(rows, asOf)
    const august = groups[7]

    expect(august.anniversaries.map((a) => a.employeeName)).toEqual([
      'Alpha,Bob',
      'Zebra,Ann',
      'Middle,Chris',
    ])
    expect(august.anniversaries.map((a) => a.yearsOfServiceThisYear)).toEqual([
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

  it('keeps members after anniversary day with years still N', () => {
    const asOf = new Date(2026, 7, 1) // August — March 15th already passed
    const cohort = calendarYearMilestoneCohort(rows, asOf, 15)
    const zebra = cohort.find((a) => a.employeeName === 'Zebra,Zed')
    expect(zebra).toBeDefined()
    expect(zebra!.yearsOfServiceThisYear).toBe(15)
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
    expect(results.groups[0].month).toBe('January')
    expect(results.groups[7].isCurrentMonth).toBe(true)
    expect(results.fifteenYearCohort).toHaveLength(1)
    expect(results.fifteenYearCohort[0].employeeName).toBe('Milestone,M')
    expect(FIFTEEN_YEAR_MILESTONE).toBe(15)

    const november = results.groups.find((g) => g.month === 'November')
    expect(
      november?.anniversaries.some((a) => a.employeeName === 'Milestone,M'),
    ).toBe(true)
  })
})
