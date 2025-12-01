# Fattern (Local-First Desktop Core)

Fattern is a modern, local-first invoicing and expense manager for freelancers and small Norwegian businesses. The desktop app stores everything in SQLite on the user's machine—no logins, no cloud dependency.

This repository currently contains the groundwork for the data layer described in `PROJECT.md`, including a reproducible SQLite schema and a helper script to create the database in the expected filesystem layout.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Initialize the local database (creates `~/Fattern/data/fattern.db` and supporting folders):
   ```bash
   npm run init-db
   ```
3. The script will confirm the paths and ensure the schema tables exist:
   - companies
   - customers
   - products
   - invoices
   - invoice_items
   - expense_categories
   - expenses
   - invoice_expense_links
   - budget_years
   - settings

## Project direction

The intended stack for the desktop app is Electron + React (Vite) with TailwindCSS, Framer Motion, and `better-sqlite3` for data storage (see `PROJECT.md`). Future work will connect the renderer and main processes to this schema via IPC while keeping the app fully offline and private.
