import { useState } from 'react'
import { groupByRollingMonths, type MonthGroup } from './lib/anniversaries'
import { clear, load, save } from './lib/persistedEmployees'
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
      fileName: string
      savedAt: Date
    }

function initialState(): AppState {
  const persisted = load()
  if (!persisted || persisted.rows.length === 0) {
    return { view: 'landing', error: null, busy: false }
  }

  const asOf = new Date()
  return {
    view: 'results',
    groups: groupByRollingMonths(persisted.rows, asOf),
    asOf,
    totalPeople: persisted.rows.length,
    fileName: persisted.fileName,
    savedAt: persisted.savedAt,
  }
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState)

  async function handleFile(file: File) {
    setState({ view: 'landing', error: null, busy: true })

    const result = await processWorkbook(file)

    if (!result.ok) {
      setState({ view: 'landing', error: result.error, busy: false })
      return
    }

    const savedAt = new Date()
    save(file.name, result.rows)

    setState({
      view: 'results',
      groups: result.groups,
      asOf: result.asOf,
      totalPeople: result.totalPeople,
      fileName: file.name,
      savedAt,
    })
  }

  if (state.view === 'results') {
    return (
      <ResultsView
        groups={state.groups}
        asOf={state.asOf}
        totalPeople={state.totalPeople}
        fileName={state.fileName}
        savedAt={state.savedAt}
        onReset={() =>
          setState({ view: 'landing', error: null, busy: false })
        }
        onClear={() => {
          clear()
          setState({ view: 'landing', error: null, busy: false })
        }}
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
