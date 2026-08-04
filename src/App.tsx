import { useState } from 'react'
import { groupByRollingMonths, type MonthGroup } from './lib/anniversaries'
import { parseWorkbook } from './lib/parseWorkbook'
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

    try {
      const buffer = await file.arrayBuffer()
      const result = await parseWorkbook(buffer)

      if (!result.ok) {
        setState({ view: 'landing', error: result.error, busy: false })
        return
      }

      const asOf = new Date()
      const groups = groupByRollingMonths(result.rows, asOf)
      setState({
        view: 'results',
        groups,
        asOf,
        totalPeople: result.rows.length,
      })
    } catch {
      setState({
        view: 'landing',
        error: 'Something went wrong while reading the file. Please try again.',
        busy: false,
      })
    }
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
