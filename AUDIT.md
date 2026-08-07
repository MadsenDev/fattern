# Fattern — Codebase Audit

**Date:** 2026-08-07
**Commit audited:** `b03e2eb`
**Build status:** `npm run ui:build` passes clean (14.6s, 1.21 MB / 330 KB gzip single chunk)

This audit compares the actual state of the codebase against `TASKS/HANDOFF.md`
and `TODO.md`. The headline finding is that **the planning docs are significantly
staler than the code** — four of the seven v1 tasks are done but recorded as
pending, while the one task that actually blocks a release has not been started.

---

## 1. Task status vs. HANDOFF.md

| Task | Doc says | Actual state |
|------|----------|--------------|
| 01 — deps & i18n | Critical, pending | **Done.** `en.json`/`no.json` at exact key parity (966 each), language selector shipped, `APP_VERSION` bumped to `0.6.0`. See §3 for residual leaks. |
| 02 — search & filtering | Critical, pending | **Done.** `SearchBar` wired into Customers, Products, Invoices, and Expenses pages. |
| 03 — chart & expense linking | High, pending | **Done.** `IncomeExpenseChart` rendered at `src/ui/src/components/dashboard/DashboardView.jsx:491`; link/unlink implemented full-stack (`fatternDatabase.js:1022` → `dbHandlers.js:116` → `preload.js:55` → `InvoiceViewModal.jsx:243`). |
| 04 — SAF-T import | High, pending | **Done.** Implemented in `src/electron/saftImporter.js` (220 lines) + `saftImportHandler.js` (222 lines). |
| 05 — template discoverability & multi-page | Medium, pending | **Not started.** See §2. |
| 06 — recurring invoices | Medium, pending | **Not started.** Zero occurrences of `recurring`/`recurrence` anywhere in `src/`. |
| 07 — build & release | Critical (last), pending | **Not started.** See §2. |

Work shipped that was never in the 7-task plan: SMTP email sending
(`src/electron/emailHandler.js`), and the per-invoice audit log
(`invoice_events`).

---

## 2. Release blockers

### 2.1 Task 07 — no packaging or release pipeline (critical)

Nothing exists:

- No `.github/workflows/` directory at all.
- No `electron-builder` dependency and no builder config.
- No `build:win` / `build:linux` scripts in `package.json`.

Four of the eight "Definition of Done for v1" checkboxes depend on this, and
it is the item most likely to surface unpleasant surprises — cross-platform
`better-sqlite3` native rebuilds and code signing are both discovered late and
painfully. Recommend doing this **first**, not last: everything else is polish
on an app no one can install.

### 2.2 Task 05 — invoices are single-page only

`src/electron/templatePdfGenerator.js` contains zero `addPage` calls. Any
invoice with enough line items to overflow one page will be silently truncated
in the generated PDF. This is a correctness bug for real users, not just a
missing feature.

---

## 3. Defects and dead code

### 3.1 `src/ui/src/utils/saftParser.js` is a dead stub (delete it)

A 45-line file of unimplemented bodies — `TODO: Implement SAF-T validation`
(line 12), `TODO: Implement SAF-T parsing` (line 21), `TODO: Convert SAF-T
structure` (line 37) — whose `validateSAFT` returns
`'SAF-T import er ikke implementert ennå'`.

It is **imported by nothing**. The working importer lives in
`src/electron/saftImporter.js`. The file only serves to make SAF-T look
unimplemented to anyone reading the UI tree. Delete.

### 3.2 Expense→invoice link never renders

`src/ui/src/components/expenses/ExpenseDetailPanel.jsx:210` guards on
`expense.linked_invoice_id`:

```jsx
{expense.linked_invoice_id && (
  ... Faktura #{expense.linked_invoice_id}
)}
```

That field exists in no table and is produced by no query. The actual link
table is `invoice_expense_links` (`src/db/schema.js:109`). The guard is
therefore always falsy, so the expense side of expense↔invoice linking is
permanently invisible — only the invoice side (`InvoiceViewModal`) works.

Fix: expose the link from the expense query (join `invoice_expense_links`), or
drop the block.

### 3.3 No error boundaries

Zero occurrences of `ErrorBoundary` or `componentDidCatch` in `src/ui/src`. In
an Electron app a single render error white-screens the entire window with no
recovery path and no visible cause for the user. Cheap to add, high value
before shipping to non-technical users.

### 3.4 Dev-only tooling ships in the production bundle

`src/ui/src/components/settings/DevSettings.jsx:5-6` statically imports
`TesseractTest` and `CreditLedgerViewer`. Static imports mean both are bundled
unconditionally, pulling `tesseract.js` into the shipped output. This is a
meaningful share of the 1.21 MB single chunk. Convert to `React.lazy` behind
the dev-mode flag.

### 3.5 `parseDateInput` only half-consolidated

HANDOFF known-issue #1 is partly resolved: the shared implementation now lives
at `src/ui/src/utils/formatDate.js:31` and `InvoiceModal.jsx` imports it. But
`src/ui/src/components/DatePicker.jsx:14` still defines its own private copy,
used at lines 117 and 130.

---

## 4. Localization gaps

The `en`/`no` files are at exact parity, but translation coverage is not
complete. Two distinct classes of problem remain.

### 4.1 Hardcoded Norwegian in JSX

| File | Line | String |
|------|------|--------|
| `components/Select.jsx` | 151, 152 | `Lagre`, `Avbryt` |
| `components/invoices/InvoiceModal.jsx` | 257, 262, 356, 613, 618 | `Velg kunde`, `Ingen kunder tilgjengelig`, `Fakturadato *`, `Produkter`, `Ingen produkter tilgjengelig` |
| `components/ImageUpload.jsx` | 145 | `Velg bilde` |
| `components/expenses/ExpenseModal.jsx` | 365 | `Legg til linjeelementer for å dele opp utgiften` |
| `components/expenses/ExpenseDetailPanel.jsx` | 213, 216 | `Lenket faktura`, `Faktura #` |
| `components/settings/ImportSettings.jsx` | 174 | `Fakturaer:` |

This fails the stated DoD item "No hardcoded English strings remain in the UI"
(mirrored for Norwegian).

### 4.2 Norwegian generated in the backend (structural)

These are produced outside React and reach the UI as *data*, so i18next cannot
translate them at all. They will stay Norwegian even with the language set to
English:

| File | Line | String |
|------|------|--------|
| `src/db/fatternDatabase.js` | 928 | `Ukategorisert` (synthetic expense category row) |
| `src/db/fatternDatabase.js` | 888 | `Ukjent leverandør` |
| `src/db/fatternDatabase.js` | 472, 481 | `Beløp`, `Vår ref.` |
| `src/electron/emailHandler.js` | 161 | `SMTP ikke konfigurert. Gå til Innstillinger → E-post.` |
| `src/electron/saftImporter.js` | 124 | `Ukjent leverandør` |
| `src/electron/saftImportHandler.js` | 193 | `Ukjent leverandør` |

Fix pattern: return a stable key (e.g. `expense.uncategorised`) from the
backend and translate at the render site.

**Scan caveat:** §4 was produced by grepping for Norwegian characters and
common Norwegian words in JSX. Treat these tables as a lower bound, not a
complete inventory.

---

## 5. Already fixed since HANDOFF was written

Three of the five "Known Issues to Fix Along the Way" no longer apply:

- **#3 template image upload** — `TemplateProperties.jsx:339` now correctly
  uses `template?.meta?.id || template?.id`.
- **#4 budget year date format** — `BudgetYearModal.jsx:9-10` now passes the
  raw ISO date to `DatePicker` instead of the `dd.mm.yyyy` formatted value.
- **#5 version number** — `version.js` is at `0.6.0`.

Issue #1 is partly fixed (see §3.5). Issue #2 (expense amount validation
wording) was not re-verified in this pass.

---

## 6. Stale documentation

`TODO.md` needs a pass. Items listed as pending that are in fact complete:

- Entire **Localization** section (all five unchecked; the first four are done)
- **Search and filtering** under Advanced Features
- **SAF-T import** — listed twice as pending, both times inaccurate
- **Email integration** — unchecked, but SMTP sending is implemented

`TASKS/HANDOFF.md` should be updated to mark tasks 01–04 complete so the
remaining work is legible at a glance.

---

## 7. Recommended order

1. **Task 07 (packaging + CI).** The only thing between the current code and a
   v1 anyone can install, and the highest-risk unknown.
2. **Cleanup batch** — §3.1, §3.2, §3.5, §3.4, and §4.1 together. All small,
   all mechanical, one focused pass.
3. **§3.3 error boundaries** before any non-technical user touches a build.
4. **§2.2 multi-page PDFs** — a real correctness bug on long invoices.
5. **Task 06 (recurring invoices)** — genuine new feature work, and the only
   remaining item that is.
6. **§4.2 backend string extraction** — worth doing before English is
   advertised as a supported language.
