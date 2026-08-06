# Work Anniversaries

A client-only React app that turns an HR employee export (`.xlsx`) into a calendar-year view of service anniversaries, grouped by month from January through December. All parsing and computation happens in the browser — nothing is uploaded to a server.

Hosted as a GitHub Pages project site at `/xl-anniversaries/`.

## Input format

Upload an Excel export with a header row. Required columns (matched case-insensitively after trimming):

| Column | Example header |
|---|---|
| Employee name | `Employee Reporting Name` |
| Service date | `Service Date` (Excel date serial or parseable date; also matches `Anniversary Date` / `Hire Date`) |
| Manager | `Manager Name` |

Other columns in the export are ignored. Footer rows such as `Total` are skipped.

## What it computes

For each employee, as of the reference date (today when you open the app):

- **Anniversary date** — the original hire / service date from the export
- **Years of service this year** — calendar-year milestone: `as-of year − hire year` (same number before and after their anniversary day in that year; `0` for same-year hires)
- **Anniversary month** — month of the service date

Results are shown as:

1. **15-year cohort** — people whose 15th anniversary falls in the as-of calendar year (kept through Dec 31 of that year)
2. **Month accordion** — all twelve months in calendar order (January–December). Within a month, people are sorted by day of month, then name. Empty months are listed. The current month opens by default and is labeled “This month”; any open month uses the same emphasized panel styling.

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
