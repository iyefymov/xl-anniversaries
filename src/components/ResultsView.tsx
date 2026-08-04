import { formatReferenceDate, type MonthGroup } from '../lib/anniversaries'
import { MonthAccordion } from './MonthAccordion'

type ResultsViewProps = {
  groups: MonthGroup[]
  asOf: Date
  totalPeople: number
  onReset: () => void
}

export function ResultsView({
  groups,
  asOf,
  totalPeople,
  onReset,
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
              {totalPeople} {totalPeople === 1 ? 'person' : 'people'} · as of{' '}
              {formatReferenceDate(asOf)}
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="border border-ink/15 bg-white/70 px-4 py-2 text-sm font-medium text-ink transition hover:border-teal hover:text-teal"
          >
            Upload another file
          </button>
        </div>

        <div className="mt-8">
          <MonthAccordion groups={groups} />
        </div>

        <p className="privacy-note mt-10">
          Processed entirely in your browser; nothing is uploaded to a server.
        </p>
      </div>
    </main>
  )
}
