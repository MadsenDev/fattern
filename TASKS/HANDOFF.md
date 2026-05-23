# Fattern v1 — Claude Code Handoff

## Project Overview
Fattern is a local-first desktop invoicing and expense management app for Norwegian
freelancers and small businesses. Built with Electron + React + Vite + TailwindCSS + SQLite
(better-sqlite3). The app is entirely free — no subscription, no accounts, no cloud.
An optional Supporter Pack enables premium themes, premium invoice templates, and AI features.

**Repository:** github.com/MadsenDev/fattern (all files are public)
**Stack:** Electron 30, React 18, Vite 5, TailwindCSS 3, better-sqlite3, Framer Motion
**Key directories:**
- `src/electron/` — main process, IPC handlers, PDF generation
- `src/db/` — SQLite schema, FatternDatabase class, template storage
- `src/ui/src/` — React frontend (pages, components, hooks, utils)
- `src/ui/src/i18n/` — i18next translation files

---

## How to Work on This Project

1. Always run `npm run electron:rebuild` after changing or installing native modules
2. Dev mode: `npm run desktop:dev` (starts Vite dev server + Electron)
3. UI only: `npm run ui:dev` then open http://localhost:4173
4. Build check: `npm run ui:build` (must succeed before considering any task done)

---

## Task Order

Complete tasks in this order. Each task is self-contained and has its own file
with full implementation details. Do not combine tasks — complete and verify each
before starting the next.

| Task | File | Description | Priority |
|------|------|-------------|----------|
| 01 | TASK-01-deps-and-i18n.md | Update dependencies, complete Norwegian translation | Critical |
| 02 | TASK-02-search-and-filtering.md | Search and filter on all list views | Critical |
| 03 | TASK-03-chart-and-expense-linking.md | Income/expense chart, expense-invoice linking | High |
| 04 | TASK-04-saft-import.md | Full SAF-T XML import from Norwegian accounting systems | High |
| 05 | TASK-05-template-discoverability.md | Template editor discoverability, multi-page invoices | Medium |
| 06 | TASK-06-recurring-invoices.md | Recurring invoice schedules | Medium |
| 07 | TASK-07-build-and-release.md | Packaging, GitHub Actions, landing page | Critical (last) |

---

## Known Issues to Fix Along the Way

These are small bugs spotted in the codebase. Fix them in whichever task they're
most relevant to, or in Task 01 if they don't belong anywhere else.

**1. parseDateInput inconsistency**
The function `parseDateInput` is defined inline in multiple components
(`InvoiceModal.jsx`, `ExpenseModal.jsx`, `BudgetYearModal.jsx`) rather than
imported from a shared utility. Consolidate into `src/ui/src/utils/formatDate.js`
and import from there everywhere.

**2. Expense amount field required/optional inconsistency**
In `ExpenseModal.jsx`, the amount field is required when there are no line items,
but the validation message says "eller legg til linjeelementer" even when the
line items section is empty. Clean up the validation logic.

**3. Template editor image upload**
`src/ui/src/components/ImageUpload.jsx` passes `templateId` and `elementId` to
`window.fattern.template.saveImage`, but the `TemplateProperties.jsx` passes
`template.id` (old format) instead of `template.meta?.id` (new format).
This means image uploads in the template editor may not save to the correct path.
Fix to consistently use `template.meta?.id || template.id`.

**4. Budget year date format**
In `BudgetYearModal.jsx`, `formatDate` is imported from utils and called on
`initialYear.start_date`, but then the result is passed to `DatePicker` which
expects `yyyy-mm-dd` format. `formatDate` returns `dd.mm.yyyy`. This causes
the date picker to show the wrong value when editing a budget year.
Fix: pass the raw ISO date string to DatePicker, not the formatted version.

**5. Version number**
`src/ui/src/utils/version.js` hardcodes `'0.5.0'`. This is resolved by Task 07,
but if Task 07 is done last, update it manually to `'0.6.0'` as part of Task 01.

---

## Do Not Change

These parts of the codebase are working correctly and should not be modified
unless a task explicitly requires it:

- The SQLite schema in `src/db/schema.js` (add via migrations in `initDatabase.js` only)
- The FatternDatabase class structure (add methods, don't refactor existing ones)
- The IPC bridge pattern (`dbHandlers.js` → `preload.js` → React hooks)
- The Supporter Pack cryptographic ledger in `src/ui/src/utils/creditSecurity.js`
- The template renderer pipeline in `src/electron/templatePdfGenerator.js`
- The theme system in `src/ui/src/themes/`

---

## Definition of Done for v1

The app is ready for v1 release when:
- [ ] All 7 tasks are complete
- [ ] `npm run build:win` and `npm run build:linux` succeed
- [ ] The packaged app installs and launches without errors
- [ ] Database persists between app restarts
- [ ] The complete user flow works: install → onboarding → add customer → create invoice → generate PDF
- [ ] All UI is in Norwegian
- [ ] No hardcoded English strings remain in the UI
- [ ] GitHub Actions produces release artifacts on version tag push
- [ ] Landing page is live with download links
