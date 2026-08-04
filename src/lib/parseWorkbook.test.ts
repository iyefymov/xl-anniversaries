import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { parseCellDate, parseWorkbook } from './parseWorkbook'

function workbookBuffer(
  rows: (string | number | null)[][],
): ArrayBuffer {
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, 'Export')
  const written = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as
    | ArrayBuffer
    | Uint8Array
    | number[]

  if (written instanceof ArrayBuffer) return written
  if (written instanceof Uint8Array) {
    return written.buffer.slice(
      written.byteOffset,
      written.byteOffset + written.byteLength,
    ) as ArrayBuffer
  }
  return Uint8Array.from(written).buffer
}

describe('parseCellDate', () => {
  it('parses excel serials to local calendar dates', () => {
    // Synthetic serial: 43597 → 2019-05-12
    const d = parseCellDate(43597)
    expect(d).toEqual(new Date(2019, 4, 12))
  })

  it('parses ISO-like strings', () => {
    expect(parseCellDate('2018-06-20')).toEqual(new Date(2018, 5, 20))
  })
})

describe('parseWorkbook', () => {
  it('maps fuzzy headers and skips footer / empty rows', async () => {
    const buf = workbookBuffer([
      [
        'Manager Position Desc',
        'Employee Reporting Name',
        'Service Date',
        'Manager Name',
        'Employee ID',
      ],
      // 43597 = synthetic Excel serial for 2019-05-12
      ['Team Lead', 'Rivera,Maya', 43597, 'Okonkwo, Sam', '90001'],
      ['Team Lead', '', 43597, 'Okonkwo, Sam', '90002'],
      ['Total', '', '', '', ''],
      ['No filters applied', '', '', '', ''],
    ])

    const result = await parseWorkbook(buf)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].employeeName).toBe('Rivera,Maya')
    expect(result.rows[0].managerName).toBe('Okonkwo, Sam')
    expect(result.rows[0].serviceDate).toEqual(new Date(2019, 4, 12))
  })

  it('accepts case/whitespace variants for headers', async () => {
    const buf = workbookBuffer([
      ['  employee reporting name ', 'SERVICE DATE', 'manager name'],
      ['Chen,Avery', 43597, 'Patel, Jordan'],
    ])

    const result = await parseWorkbook(buf)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.rows[0].employeeName).toBe('Chen,Avery')
  })

  it('reports missing required columns', async () => {
    const buf = workbookBuffer([
      ['Employee Reporting Name', 'Hire Day', 'Boss'],
      ['Chen,Avery', 43597, 'Patel, Jordan'],
    ])

    const result = await parseWorkbook(buf)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('Service Date')
    expect(result.error).toContain('Manager Name')
  })
})
