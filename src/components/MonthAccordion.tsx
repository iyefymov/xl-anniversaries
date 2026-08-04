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
        const current = group.isCurrentMonth

        return (
          <section
            key={group.month}
            className="month-panel"
            data-current={current || undefined}
          >
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                className={
                  current
                    ? 'flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-ink transition'
                    : 'flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-ink-soft transition hover:text-ink'
                }
                onClick={() =>
                  setOpenMonth((currentOpen) =>
                    currentOpen === group.month ? null : group.month,
                  )
                }
              >
                <span className="flex items-baseline gap-3">
                  <span
                    className={
                      current
                        ? 'font-serif text-2xl font-semibold'
                        : 'font-serif text-xl font-medium'
                    }
                  >
                    {group.month}
                  </span>
                  {current ? (
                    <span className="text-xs font-medium tracking-[0.12em] text-teal uppercase">
                      This month
                    </span>
                  ) : null}
                </span>
                <span
                  className="month-count"
                  data-current={current || undefined}
                >
                  {count}
                </span>
              </button>
            </h2>

            {isOpen ? (
              <div className="animate-accordion-in border-t border-paper-deep px-4 py-2">
                <div className="person-grid-header">
                  <span>Employee</span>
                  <span>Anniversary date</span>
                  <span>Manager</span>
                  <span className="text-right">Years</span>
                </div>
                <AnniversaryList
                  anniversaries={group.anniversaries}
                  emphasized={current}
                />
              </div>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
