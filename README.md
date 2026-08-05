# Work Anniversaries

A client-only React app that turns an HR employee export (`.xlsx`) into a month-by-month view of upcoming work anniversaries. All parsing and computation happens in the browser — nothing is uploaded to a server.

Hosted as a GitHub Pages project site at `/xl-anniversaries/`.

## Input format

Upload an Excel export with a header row. Required columns (matched case-insensitively after trimming):

| Column | Example header |
|---|---|
| Employee name | `Employee Reporting Name` |
| Service date | `Service Date` (Excel date serial or parseable date) |
| Manager | `Manager Name` |

Other columns in the export are ignored. Footer rows such as `Total` are skipped.

## What it computes

For each employee:

- **Anniversary date** — the original service date
- **Upcoming years of service** — full years completed on the next anniversary on or after today
- **Anniversary month** — month of the service date

Results are grouped in a rolling 12-month accordion starting from the current month. Within a month, people are sorted by day of month, then name. The current month is emphasized.

## Persistence

The last successfully uploaded export is remembered in this browser’s `localStorage` so you can refresh or reopen the app without re-uploading. On load, anniversary math is recomputed for today. Uploading a new file replaces the saved data. Nothing is sent to a server.

## Local development

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
npm run preview
```

## GitHub Pages

On every push to `main`, GitHub Actions runs tests, builds the app (`base: /xl-anniversaries/`), and deploys `dist` to GitHub Pages.

In the repository settings:

1. **Pages** → Source: **GitHub Actions**
2. Ensure the repo name is `xl-anniversaries` (or update `base` in `vite.config.ts` to match)

Site URL shape: `https://<user>.github.io/xl-anniversaries/`
