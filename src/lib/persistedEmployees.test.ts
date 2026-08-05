import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import type { EmployeeRow } from './anniversaries'
import {
  clear,
  load,
  parseLocalDateString,
  save,
  STORAGE_KEY,
  toLocalDateString,
} from './persistedEmployees'

/** Minimal localStorage for Node test env. */
function installLocalStorageMock() {
  const store = new Map<string, string>()
  const mock = {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
    removeItem(key: string) {
      store.delete(key)
    },
    clear() {
      store.clear()
    },
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: mock,
    configurable: true,
    writable: true,
  })
}

const sampleRows: EmployeeRow[] = [
  {
    employeeName: 'Ada Lovelace',
    serviceDate: new Date(2019, 2, 12),
    managerName: 'Charles Babbage',
  },
  {
    employeeName: 'Grace Hopper',
    serviceDate: new Date(2020, 11, 9),
    managerName: 'Howard Aiken',
  },
]

beforeAll(() => {
  installLocalStorageMock()
})

afterEach(() => {
  clear()
})

describe('toLocalDateString / parseLocalDateString', () => {
  it('round-trips local calendar dates', () => {
    const date = new Date(2019, 2, 12)
    expect(toLocalDateString(date)).toBe('2019-03-12')
    const parsed = parseLocalDateString('2019-03-12')
    expect(parsed).not.toBeNull()
    expect(parsed!.getFullYear()).toBe(2019)
    expect(parsed!.getMonth()).toBe(2)
    expect(parsed!.getDate()).toBe(12)
  })

  it('rejects invalid date strings', () => {
    expect(parseLocalDateString('2019-02-30')).toBeNull()
    expect(parseLocalDateString('not-a-date')).toBeNull()
  })
})

describe('persistedEmployees', () => {
  it('round-trips save → load for names, managers, and dates', () => {
    save('employees.xlsx', sampleRows)
    const loaded = load()
    expect(loaded).not.toBeNull()
    expect(loaded!.fileName).toBe('employees.xlsx')
    expect(loaded!.savedAt.getTime()).not.toBeNaN()
    expect(loaded!.rows).toHaveLength(2)
    expect(loaded!.rows[0]).toEqual({
      employeeName: 'Ada Lovelace',
      serviceDate: new Date(2019, 2, 12),
      managerName: 'Charles Babbage',
    })
    expect(loaded!.rows[1]).toEqual({
      employeeName: 'Grace Hopper',
      serviceDate: new Date(2020, 11, 9),
      managerName: 'Howard Aiken',
    })
  })

  it('returns null when storage is empty', () => {
    expect(load()).toBeNull()
  })

  it('returns null and clears corrupt payload', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(load()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('returns null and clears wrong version', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 99,
        fileName: 'x.xlsx',
        savedAt: new Date().toISOString(),
        rows: [],
      }),
    )
    expect(load()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('returns null and clears invalid row dates', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        fileName: 'x.xlsx',
        savedAt: new Date().toISOString(),
        rows: [
          {
            employeeName: 'Ada',
            serviceDate: 'bogus',
            managerName: 'Boss',
          },
        ],
      }),
    )
    expect(load()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('clear removes stored data', () => {
    save('employees.xlsx', sampleRows)
    expect(load()).not.toBeNull()
    clear()
    expect(load()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
