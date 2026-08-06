import type { ReactNode } from 'react'

type CollapsibleAnniversaryPanelProps = {
  title: string
  badge?: string
  count: number
  isOpen: boolean
  onToggle: () => void
  emphasized?: boolean
  children: ReactNode
}

export function CollapsibleAnniversaryPanel({
  title,
  badge,
  count,
  isOpen,
  onToggle,
  emphasized = false,
  children,
}: CollapsibleAnniversaryPanelProps) {
  return (
    <section className="month-panel" data-current={emphasized || undefined}>
      <h2>
        <button
          type="button"
          aria-expanded={isOpen}
          className={
            emphasized
              ? 'flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-ink transition'
              : 'flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-ink-soft transition hover:text-ink'
          }
          onClick={onToggle}
        >
          <span className="flex flex-wrap items-baseline gap-3">
            <span
              className={
                emphasized
                  ? 'font-serif text-2xl font-semibold'
                  : 'font-serif text-xl font-medium'
              }
            >
              {title}
            </span>
            {badge ? (
              <span className="text-xs font-medium tracking-[0.12em] text-teal uppercase">
                {badge}
              </span>
            ) : null}
          </span>
          <span className="month-count" data-current={emphasized || undefined}>
            {count}
          </span>
        </button>
      </h2>

      {isOpen ? (
        <div className="animate-accordion-in border-t border-paper-deep px-4 py-2">
          {children}
        </div>
      ) : null}
    </section>
  )
}
