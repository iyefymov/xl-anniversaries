import {
  buildAnniversaryResults,
  type Anniversary,
  type EmployeeRow,
  type MonthGroup,
} from './anniversaries'
import { parseWorkbook } from './parseWorkbook'

export type ProcessSuccess = {
  ok: true
  groups: MonthGroup[]
  fifteenYearCohort: Anniversary[]
  asOf: Date
  totalPeople: number
  rows: EmployeeRow[]
}

export type ProcessFailure = {
  ok: false
  error: string
}

export type ProcessResult = ProcessSuccess | ProcessFailure

/**
 * Parse an employee export and build anniversary results (months + cohort).
 * UI only needs to drive this and reflect the result in state.
 */
export async function processWorkbook(
  file: File,
  asOf: Date = new Date(),
): Promise<ProcessResult> {
  try {
    const buffer = await file.arrayBuffer()
    const parsed = await parseWorkbook(buffer)

    if (!parsed.ok) {
      return parsed
    }

    const results = buildAnniversaryResults(parsed.rows, asOf)

    return {
      ok: true,
      groups: results.groups,
      fifteenYearCohort: results.fifteenYearCohort,
      asOf: results.asOf,
      totalPeople: parsed.rows.length,
      rows: parsed.rows,
    }
  } catch {
    return {
      ok: false,
      error: 'Something went wrong while reading the file. Please try again.',
    }
  }
}
