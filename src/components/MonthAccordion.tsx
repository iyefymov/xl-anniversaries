import { useState } from 'react'
import type { MonthGroup } from '../lib/anniversaries'
import { AnniversaryList } from './AnniversaryList'
import { CollapsibleAnniversaryPanel } from './CollapsibleAnniversaryPanel'
import { PersonGridHeader } from './PersonGridHeader'

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
        const current = group.isCurrentMonth

        return (
          <CollapsibleAnniversaryPanel
            key={group.month}
            title={group.month}
            badge={current ? 'This month' : undefined}
            count={group.anniversaries.length}
            isOpen={isOpen}
            emphasized={isOpen}
            onToggle={() =>
              setOpenMonth((currentOpen) =>
                currentOpen === group.month ? null : group.month,
              )
            }
          >
            <PersonGridHeader />
            <AnniversaryList
              anniversaries={group.anniversaries}
              emphasized={isOpen}
            />
          </CollapsibleAnniversaryPanel>
        )
      })}
    </div>
  )
}
