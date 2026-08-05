import { useState } from 'react'
import type { MonthGroup } from './lib/anniversaries'
import { processWorkbook } from './lib/processWorkbook'
import { UploadLanding } from './components/UploadLanding'
import { ResultsView } from './components/ResultsView'

type AppState =
  | { view: 'landing'; error: string | null; busy: boolean }
  | {
      view: 'results'
      groups: MonthGroup[]
      asOf: Date
      totalPeople: number
    }

export default function App() {
  const [state, setState] = useState<AppState>({
    view: 'landing',
    error: null,
    busy: false,
  })

  async function handleFile(file: File) {
    setState({ view: 'landing', error: null, busy: true })

    const result = await processWorkbook(file)

    if (!result.ok) {
      setState({ view: 'landing', error: result.error, busy: false })
      return
    }

    setState({
      view: 'results',
      groups: result.groups,
      asOf: result.asOf,
      totalPeople: result.totalPeople,
    })
  }

  if (state.view === 'results') {
    return (
      <ResultsView
        groups={state.groups}
        asOf={state.asOf}
        totalPeople={state.totalPeople}
        onReset={() =>
          setState({ view: 'landing', error: null, busy: false })
        }
      />
    )
  }

  return (
    <UploadLanding
      error={state.error}
      busy={state.busy}
      onFile={handleFile}
    />
  )
}
