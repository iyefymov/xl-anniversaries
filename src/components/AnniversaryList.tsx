import { formatServiceDate, pluralize } from '../lib/format'
import type { Anniversary } from '../lib/anniversaries'

type AnniversaryListProps = {
  anniversaries: Anniversary[]
  emphasized?: boolean
  /** Overrides years column; defaults to truthful upcoming years of service. */
  yearsShown?: (anniversary: Anniversary) => number
  emptyMessage?: string
}

export function AnniversaryList({
  anniversaries,
  emphasized = false,
  yearsShown = (a) => a.upcomingYearsOfService,
  emptyMessage = 'No anniversaries this month.',
}: AnniversaryListProps) {
  if (anniversaries.length === 0) {
    return (
      <p className="px-1 py-3 text-sm text-slate-mist">{emptyMessage}</p>
    )
  }

  return (
    <ul className="divide-y divide-paper-deep">
      {anniversaries.map((person) => (
        <li
          key={`${person.employeeName}-${person.serviceDate.toISOString()}-${person.managerName}`}
          className={`person-grid ${emphasized ? 'text-ink' : 'text-ink-soft'}`}
        >
          <span className="font-medium text-ink">{person.employeeName}</span>
          <span className="text-sm tabular-nums">
            {formatServiceDate(person.serviceDate)}
          </span>
          <span className="text-sm">{person.managerName || '—'}</span>
          <span
            className={
              emphasized
                ? 'text-sm font-semibold tabular-nums text-teal'
                : 'text-sm font-semibold tabular-nums text-ink-soft'
            }
          >
            {pluralize(yearsShown(person), 'year')}
          </span>
        </li>
      ))}
    </ul>
  )
}
