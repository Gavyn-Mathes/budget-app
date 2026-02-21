# budget-app

Desktop budgeting app built with Electron, React, TypeScript, and SQLite.

## Features

- Track budgets by month
- Manage budget categories, incomes, transactions, and distributions
- Manage funds, assets, liabilities, event types, and fund event lines
- Manage accounts, account types, account assets, and account liabilities
- Local-first SQLite storage with migration support
- In-app update checker (checks GitHub releases and opens release page)

## Tech stack

- Electron + electron-vite
- React + React Router
- TypeScript
- better-sqlite3
- Zod

## Project structure

```text
src/
  main/        Electron main process (window, DB init, IPC, updater)
  preload/     Safe API bridge exposed to renderer
  renderer/    React UI
  shared/      Shared types, schemas, domain logic, IPC contracts
resources/
  migrations/  SQLite SQL migrations
docs/          Release/signing notes
```

## Prerequisites

- Node.js 22 (recommended)
- npm

## Getting started

```bash
npm ci
npm run dev
```

This starts the app in development mode using `electron-vite`.

## Available scripts

- `npm run dev` - Start Electron + Vite in development mode
- `npm run build` - Build main/preload/renderer into `out/`
- `npm run preview` - Preview built app
- `npm run start` - Start Electron app from project root
- `npm run dist` - Build production installers for current platform
- `npm run dist:win` - Build Windows NSIS installer
- `npm run dist:mac` - Build macOS artifacts (`dmg`, `zip`)
- `npm run dist:linux` - Build Linux artifacts (`AppImage`, `deb`)
- `npm run clean` - Remove `out/`
- `npm run clean:all` - Remove build output + dependencies + lockfile
- `npm run rebuild` - Clean then build

## Database and migrations

The app runs migrations on startup and stores applied migration checksums.

Default database location:

- Development: `<repo>/data/budget.db`
- Packaged app: Electron `userData` directory (per OS)

Environment variables:

- `BUDGET_DB_PATH` - Explicit full path to DB file (highest priority)
- `BUDGET_DB_DIR` - Directory to store `budget.db`
- `BUDGET_MIGRATION_REPAIR_CHECKSUMS=1` - One-time checksum repair if an already-applied migration file changed intentionally

## Backup and restore (Windows)

For packaged installs, the default DB path is:

- `%APPDATA%\budget-app\budget.db`
- Usually: `C:\Users\<your-user>\AppData\Roaming\budget-app\budget.db`

Before installing a new version:

1. Close the app.
2. Back up the DB.

```powershell
$dbPath = Join-Path $env:APPDATA "budget-app\budget.db"
$backupDir = Join-Path $env:USERPROFILE "Desktop\budget-app-backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item $dbPath (Join-Path $backupDir "budget-$stamp.db")
```

Restore from backup:

```powershell
$dbPath = Join-Path $env:APPDATA "budget-app\budget.db"
Copy-Item "C:\path\to\backup\budget-YYYYMMDD-HHMMSS.db" $dbPath -Force
```

If you use `BUDGET_DB_PATH` or `BUDGET_DB_DIR`, back up that custom location instead.

## Update checker

When packaged, the app:

- Checks for updates after startup and periodically
- Prompts users if a newer version is available
- Opens the GitHub release page for manual download

Menu options are available in `Help`:

- `Check for Updates...`
- `View Latest Release`

Optional environment overrides:

- `BUDGET_UPDATER_GH_OWNER`
- `BUDGET_UPDATER_GH_REPO`

## Packaging notes

- Windows: unsigned installers by default (SmartScreen warnings expected)
- macOS: unsigned builds by default
- Linux: supports optional checksum signing in CI
- CI matrix builds are configured to work without code-signing certificates

See `docs/installer-signing.md` for details.

## CI release workflow

Tagging a commit with `v*` triggers the matrix release workflow in `.github/workflows/release-installers.yml`, which builds Windows, macOS, and Linux installers and publishes them as GitHub release assets.

Release sequence (keeps `main` aligned with released version):

1. Merge release-ready changes to `main`.
2. Push `main` to GitHub.
3. Create a version tag from that commit (`v*`) and push the tag.

The workflow now validates that a release tag points to a commit reachable from `origin/main`.

## Testing

Automated tests are not configured yet (`npm test` currently exits with an error).

## License

MIT
