import { useState } from 'react'
import type { MonthGroup } from '../lib/anniversaries'
import { AnniversaryList } from './AnniversaryList'

type MonthAccordionProps = {
  groups: MonthGroup[]
}

export function MonthAccordion({ groups }: MonthAccordionProps) {
  const defaultMonth =
    groups.find((g) => g.isCurrentMonth)?.month ?? groups[0]?.month ?? null
  const [openMonth, setOpenMonth] = useState<string | null>(defaultMonth)

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const isOpen = openMonth === group.month
        const count = group.anniversaries.length

        return (
          <section
            key={group.month}
            className={[
              'border transition',
              group.isCurrentMonth
                ? 'border-teal/30 bg-white/90 shadow-sm'
                : 'border-transparent bg-white/45',
            ].join(' ')}
          >
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                className={[
                  'flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition',
                  group.isCurrentMonth
                    ? 'text-ink'
                    : 'text-ink-soft hover:text-ink',
                ].join(' ')}
                onClick={() =>
                  setOpenMonth((current) =>
                    current === group.month ? null : group.month,
                  )
                }
              >
                <span className="flex items-baseline gap-3">
                  <span
                    className={[
                      'font-serif',
                      group.isCurrentMonth
                        ? 'text-2xl font-semibold'
                        : 'text-xl font-medium',
                    ].join(' ')}
                  >
                    {group.month}
                  </span>
                  {group.isCurrentMonth ? (
                    <span className="text-xs font-medium tracking-[0.12em] text-teal uppercase">
                      This month
                    </span>
                  ) : null}
                </span>
                <span
                  className={[
                    'inline-flex min-w-8 items-center justify-center px-2 py-0.5 text-sm font-semibold tabular-nums',
                    group.isCurrentMonth
                      ? 'bg-teal text-white'
                      : 'bg-paper-deep text-ink-soft',
                  ].join(' ')}
                >
                  {count}
                </span>
              </button>
            </h2>

            {isOpen ? (
              <div className="animate-accordion-in border-t border-paper-deep px-4 py-2">
                <div className="mb-1 hidden gap-4 px-1 text-xs tracking-[0.08em] text-slate-mist uppercase sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]">
                  <span>Employee</span>
                  <span>Anniversary date</span>
                  <span>Manager</span>
                  <span className="text-right">Years</span>
                </div>
                <AnniversaryList
                  anniversaries={group.anniversaries}
                  emphasized={group.isCurrentMonth}
                />
              </div>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
