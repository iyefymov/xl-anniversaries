import {
  formatAnniversaryDate,
  type Anniversary,
} from '../lib/anniversaries'

type AnniversaryListProps = {
  anniversaries: Anniversary[]
  emphasized?: boolean
}

export function AnniversaryList({
  anniversaries,
  emphasized = false,
}: AnniversaryListProps) {
  if (anniversaries.length === 0) {
    return (
      <p className="px-1 py-3 text-sm text-slate-mist">
        No anniversaries this month.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-paper-deep">
      {anniversaries.map((person) => (
        <li
          key={`${person.employeeName}-${person.anniversaryDate.toISOString()}-${person.managerName}`}
          className={[
            'grid gap-1 px-1 py-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:items-baseline sm:gap-4',
            emphasized ? 'text-ink' : 'text-ink-soft',
          ].join(' ')}
        >
          <span className="font-medium text-ink">{person.employeeName}</span>
          <span className="text-sm tabular-nums">
            {formatAnniversaryDate(person.anniversaryDate)}
          </span>
          <span className="text-sm">{person.managerName || '—'}</span>
          <span
            className={[
              'text-sm font-semibold tabular-nums',
              emphasized ? 'text-teal' : 'text-ink-soft',
            ].join(' ')}
          >
            {person.upcomingYearsOfService}{' '}
            {person.upcomingYearsOfService === 1 ? 'year' : 'years'}
          </span>
        </li>
      ))}
    </ul>
  )
}
