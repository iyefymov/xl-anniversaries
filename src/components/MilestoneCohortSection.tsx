import { useState } from 'react'
import type { Anniversary } from '../lib/anniversaries'
import { AnniversaryList } from './AnniversaryList'
import { CollapsibleAnniversaryPanel } from './CollapsibleAnniversaryPanel'
import { PersonGridHeader } from './PersonGridHeader'

type MilestoneCohortSectionProps = {
  anniversaries: Anniversary[]
  milestoneYears: number
  calendarYear: number
  emptyMessage?: string
}

export function MilestoneCohortSection({
  anniversaries,
  milestoneYears,
  calendarYear,
  emptyMessage = `No one turns ${milestoneYears} this year.`,
}: MilestoneCohortSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <CollapsibleAnniversaryPanel
      title={`${milestoneYears} Year Anniversaries`}
      badge={String(calendarYear)}
      count={anniversaries.length}
      isOpen={isOpen}
      emphasized
      onToggle={() => setIsOpen((open) => !open)}
    >
      {anniversaries.length === 0 ? (
        <p className="px-1 py-3 text-sm text-slate-mist">{emptyMessage}</p>
      ) : (
        <>
          <PersonGridHeader />
          <AnniversaryList
            anniversaries={anniversaries}
            emphasized
            yearsShown={() => milestoneYears}
          />
        </>
      )}
    </CollapsibleAnniversaryPanel>
  )
}
