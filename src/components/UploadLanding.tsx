import { FileDropzone } from './FileDropzone'

type UploadLandingProps = {
  error: string | null
  busy: boolean
  onFile: (file: File) => void
}

export function UploadLanding({ error, busy, onFile }: UploadLandingProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10">
      <div className="animate-fade-up">
        <p className="eyebrow mb-3">Internal HR</p>
        <h1 className="font-serif text-5xl leading-[1.05] font-semibold text-ink sm:text-6xl">
          Work Anniversaries
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
          Upload your employee export to see upcoming years of service, grouped
          by anniversary month.
        </p>

        <FileDropzone
          busy={busy}
          onFile={onFile}
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        >
          <span className="font-serif text-2xl font-semibold text-ink">
            Upload employee export
          </span>
          <span className="text-sm text-slate-mist">
            Drop a .xlsx file here, or choose one — needs Employee Reporting
            Name, Service Date, and Manager Name columns.
          </span>
          <span className="mt-2 inline-flex items-center bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep">
            {busy ? 'Reading file…' : 'Choose file'}
          </span>
        </FileDropzone>

        {error ? (
          <p
            role="alert"
            className="mt-4 border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        ) : null}

        <p className="privacy-note mt-8 max-w-xl">
          Processed entirely in your browser; nothing is uploaded to a server.
        </p>
      </div>
    </main>
  )
}
