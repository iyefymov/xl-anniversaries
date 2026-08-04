type UploadLandingProps = {
  error: string | null
  busy: boolean
  onFile: (file: File) => void
}

export function UploadLanding({ error, busy, onFile }: UploadLandingProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10">
      <div className="animate-fade-up">
        <p className="mb-3 text-sm font-medium tracking-[0.14em] text-teal uppercase">
          Internal HR
        </p>
        <h1 className="font-serif text-5xl leading-[1.05] font-semibold text-ink sm:text-6xl">
          Work Anniversaries
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
          Upload your employee export to see upcoming years of service, grouped
          by anniversary month.
        </p>

        <label
          className={[
            'mt-10 flex cursor-pointer flex-col items-start gap-3 border border-dashed border-slate-mist/40 bg-white/70 px-6 py-8 backdrop-blur-sm transition',
            'hover:border-teal hover:bg-teal-soft/40',
            busy ? 'pointer-events-none opacity-70' : '',
          ].join(' ')}
        >
          <span className="font-serif text-2xl font-semibold text-ink">
            Upload employee export
          </span>
          <span className="text-sm text-slate-mist">
            Any .xlsx file with Employee Reporting Name, Service Date, and
            Manager Name columns.
          </span>
          <span className="mt-2 inline-flex items-center bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep">
            {busy ? 'Reading file…' : 'Choose file'}
          </span>
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFile(file)
              e.target.value = ''
            }}
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="mt-4 border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        ) : null}

        <p className="mt-8 max-w-xl text-sm leading-relaxed text-slate-mist">
          Processed entirely in your browser; nothing is uploaded to a server.
        </p>
      </div>
    </main>
  )
}
