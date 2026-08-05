import {
  groupByRollingMonths,
  type EmployeeRow,
  type MonthGroup,
} from './anniversaries'
import { parseWorkbook } from './parseWorkbook'

export type ProcessSuccess = {
  ok: true
  groups: MonthGroup[]
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
 * Parse an employee export and build the rolling month-group view.
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

    return {
      ok: true,
      groups: groupByRollingMonths(parsed.rows, asOf),
      asOf,
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
