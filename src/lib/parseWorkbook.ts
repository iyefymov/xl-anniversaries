import type { EmployeeRow } from './anniversaries'

export type ParseSuccess = {
  ok: true
  rows: EmployeeRow[]
}

export type ParseFailure = {
  ok: false
  error: string
}

export type ParseResult = ParseSuccess | ParseFailure

const FIELD_ALIASES: Record<keyof EmployeeRow, string[]> = {
  employeeName: ['employee reporting name', 'employee name', 'name'],
  serviceDate: ['service date', 'anniversary date', 'hire date'],
  managerName: ['manager name', 'manager'],
}

const ISO_DATE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/
const NUMERIC_STRING = /^\d+(\.\d+)?$/

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/** Drop time-of-day; keep Y/M/D as a local calendar date. */
function toLocalCalendarDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * Excel stores dates as day counts since 1899-12-30.
 * Convert serial → local calendar date (UTC components → local Y/M/D).
 */
function excelSerialToDate(serial: number): Date | null {
  if (!Number.isFinite(serial)) return null
  const utc = Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000
  const d = new Date(utc)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/** Parse YYYY-MM-DD as a local calendar date (avoids UTC midnight shifts). */
function parseIsoDateString(value: string): Date | null {
  const match = value.match(ISO_DATE)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const local = new Date(year, month, day)

  const valid =
    local.getFullYear() === year &&
    local.getMonth() === month &&
    local.getDate() === day

  return valid ? local : null
}

/**
 * Turn a spreadsheet cell into a local calendar date.
 * Preferred paths: Date | Excel serial | "YYYY-MM-DD".
 * Last resort: browser Date parse of other text (less reliable).
 */
export function parseCellDate(value: unknown): Date | null {
  if (value == null || value === '') return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : toLocalCalendarDate(value)
  }

  if (typeof value === 'number') {
    return excelSerialToDate(value)
  }

  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  // Numeric string → treat as Excel serial (common when cells are text-formatted)
  if (NUMERIC_STRING.test(trimmed)) {
    return excelSerialToDate(Number(trimmed))
  }

  const fromIso = parseIsoDateString(trimmed)
  if (fromIso) return fromIso

  // Fallback for uncommon text formats (locale-dependent)
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : toLocalCalendarDate(parsed)
}

function mapHeaders(headers: unknown[]): {
  mapping: Partial<Record<keyof EmployeeRow, number>>
  missing: string[]
} {
  const normalized = headers.map(normalizeHeader)
  const mapping: Partial<Record<keyof EmployeeRow, number>> = {}

  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [
    keyof EmployeeRow,
    string[],
  ][]) {
    const idx = normalized.findIndex((h) => aliases.includes(h))
    if (idx >= 0) {
      mapping[field] = idx
    }
  }

  const missing: string[] = []
  if (mapping.employeeName == null) missing.push('Employee Reporting Name')
  if (mapping.serviceDate == null) missing.push('Service Date')
  if (mapping.managerName == null) missing.push('Manager Name')

  return { mapping, missing }
}

function isSkippableName(name: string): boolean {
  const n = name.trim().toLowerCase()
  return !n || n === 'total' || n.startsWith('no filters')
}

export async function parseWorkbook(data: ArrayBuffer): Promise<ParseResult> {
  const XLSX = await import('xlsx')

  let workbook: ReturnType<typeof XLSX.read>
  try {
    workbook = XLSX.read(new Uint8Array(data), {
      type: 'array',
      cellDates: true,
    })
  } catch {
    return {
      ok: false,
      error: 'Could not read that file. Please upload a valid .xlsx workbook.',
    }
  }

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return { ok: false, error: 'The workbook has no sheets.' }
  }

  const sheet = workbook.Sheets[sheetName]
  const matrix = XLSX.utils.sheet_to_json<(string | number | Date | null)[]>(
    sheet,
    {
      header: 1,
      defval: '',
      raw: true,
    },
  )

  if (matrix.length < 2) {
    return {
      ok: false,
      error: 'The sheet needs a header row and at least one employee row.',
    }
  }

  const { mapping, missing } = mapHeaders(matrix[0] ?? [])
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing required column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. Headers are matched case-insensitively after trimming.`,
    }
  }

  const nameIdx = mapping.employeeName!
  const dateIdx = mapping.serviceDate!
  const managerIdx = mapping.managerName!

  const rows: EmployeeRow[] = []

  for (let i = 1; i < matrix.length; i++) {
    const row = matrix[i] ?? []
    const employeeName = String(row[nameIdx] ?? '').trim()
    if (isSkippableName(employeeName)) continue

    const serviceDate = parseCellDate(row[dateIdx])
    if (!serviceDate) continue

    rows.push({
      employeeName,
      serviceDate,
      managerName: String(row[managerIdx] ?? '').trim(),
    })
  }

  if (rows.length === 0) {
    return {
      ok: false,
      error:
        'No employees with a valid name and service date were found in the file.',
    }
  }

  return { ok: true, rows }
}
