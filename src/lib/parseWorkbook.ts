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

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function excelSerialToDate(serial: number): Date | null {
  if (!Number.isFinite(serial)) return null
  // Excel epoch 1899-12-30 (accounts for the 1900 leap-year bug window)
  const utc = Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000
  const d = new Date(utc)
  // Convert to local calendar date (avoid timezone shifting the day)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

export function parseCellDate(value: unknown): Date | null {
  if (value == null || value === '') return null

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }

  if (typeof value === 'number') {
    return excelSerialToDate(value)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null

    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return excelSerialToDate(Number(trimmed))
    }

    // YYYY-MM-DD (and optional time) — parse as local calendar date
    const iso = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/,
    )
    if (iso) {
      const year = Number(iso[1])
      const month = Number(iso[2]) - 1
      const day = Number(iso[3])
      const local = new Date(year, month, day)
      if (
        local.getFullYear() === year &&
        local.getMonth() === month &&
        local.getDate() === day
      ) {
        return local
      }
    }

    const parsed = new Date(trimmed)
    if (!Number.isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    }
  }

  return null
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

    const managerName = String(row[managerIdx] ?? '').trim()

    rows.push({
      employeeName,
      serviceDate,
      managerName,
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
