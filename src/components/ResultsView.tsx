import { formatReferenceDate, pluralize } from '../lib/format'
import type { MonthGroup } from '../lib/anniversaries'
import { MonthAccordion } from './MonthAccordion'
import { PrivacyNote } from './PrivacyNote'

type ResultsViewProps = {
  groups: MonthGroup[]
  asOf: Date
  totalPeople: number
  fileName: string
  savedAt: Date
  onReset: () => void
  onClear: () => void
}

export function ResultsView({
  groups,
  asOf,
  totalPeople,
  fileName,
  savedAt,
  onReset,
  onClear,
}: ResultsViewProps) {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-10">
      <div className="animate-fade-up">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-paper-deep pb-8">
          <div>
            <p className="eyebrow">Work Anniversaries</p>
            <h1 className="font-serif text-4xl font-semibold text-ink sm:text-5xl">
              Upcoming service years
            </h1>
            <p className="mt-3 text-ink-soft">
              {pluralize(totalPeople, 'person', 'people')} · as of{' '}
              {formatReferenceDate(asOf)}
            </p>
            <p className="mt-1 text-sm text-slate-mist">
              From {fileName} · saved {formatReferenceDate(savedAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="border border-ink/15 bg-white/70 px-4 py-2 text-sm font-medium text-ink transition hover:border-teal hover:text-teal"
            >
              Upload another file
            </button>
            <button
              type="button"
              onClick={onClear}
              className="px-3 py-2 text-sm text-slate-mist transition hover:text-danger"
            >
              Clear saved data
            </button>
          </div>
        </div>

        <div className="mt-8">
          <MonthAccordion groups={groups} />
        </div>

        <PrivacyNote className="privacy-note mt-10" />
      </div>
    </main>
  )
}
