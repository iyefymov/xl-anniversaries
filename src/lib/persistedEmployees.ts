import type { EmployeeRow } from './anniversaries'
import { toLocalCalendarDate } from './dates'

export const STORAGE_KEY = 'xl-anniversaries:employees:v1'
const VERSION = 1 as const

type StoredRow = {
  employeeName: string
  serviceDate: string
  managerName: string
}

type StoredPayload = {
  version: typeof VERSION
  fileName: string
  savedAt: string
  rows: StoredRow[]
}

export type PersistedEmployees = {
  fileName: string
  savedAt: Date
  rows: EmployeeRow[]
}

const LOCAL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** Format a Date as local calendar YYYY-MM-DD. */
export function toLocalDateString(date: Date): string {
  const d = toLocalCalendarDate(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse YYYY-MM-DD as a local calendar date. */
export function parseLocalDateString(value: string): Date | null {
  const match = value.match(LOCAL_DATE)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

function serialize(fileName: string, rows: EmployeeRow[]): StoredPayload {
  return {
    version: VERSION,
    fileName,
    savedAt: new Date().toISOString(),
    rows: rows.map((row) => ({
      employeeName: row.employeeName,
      serviceDate: toLocalDateString(row.serviceDate),
      managerName: row.managerName,
    })),
  }
}

function deserialize(raw: unknown): PersistedEmployees | null {
  if (!raw || typeof raw !== 'object') return null
  const payload = raw as Partial<StoredPayload>
  if (payload.version !== VERSION) return null
  if (typeof payload.fileName !== 'string' || !payload.fileName) return null
  if (typeof payload.savedAt !== 'string') return null
  const savedAt = new Date(payload.savedAt)
  if (Number.isNaN(savedAt.getTime())) return null
  if (!Array.isArray(payload.rows)) return null

  const rows: EmployeeRow[] = []
  for (const item of payload.rows) {
    if (!item || typeof item !== 'object') return null
    const { employeeName, serviceDate, managerName } = item as StoredRow
    if (typeof employeeName !== 'string' || !employeeName.trim()) return null
    if (typeof managerName !== 'string') return null
    if (typeof serviceDate !== 'string') return null
    const date = parseLocalDateString(serviceDate)
    if (!date) return null
    rows.push({
      employeeName: employeeName.trim(),
      serviceDate: date,
      managerName: managerName.trim(),
    })
  }

  return { fileName: payload.fileName, savedAt, rows }
}

export function save(fileName: string, rows: EmployeeRow[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(fileName, rows)))
  } catch {
    // Quota exceeded or private mode — ignore; session still works in memory.
  }
}

export function load(): PersistedEmployees | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = deserialize(JSON.parse(raw) as unknown)
    if (!parsed) {
      clear()
      return null
    }
    return parsed
  } catch {
    clear()
    return null
  }
}

export function clear(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
