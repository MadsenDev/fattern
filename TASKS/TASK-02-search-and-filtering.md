# TASK 02 — Search & Filtering

## Context
Fattern is a local-first Electron + React + SQLite invoicing app. This task adds search and
filtering to the three main list views: Invoices, Customers, and Products.
There is no search anywhere in the app currently. This is a usability blocker for anyone
with more than ~20 records.

---

## 1. Shared Search Hook

Create `src/ui/src/hooks/useSearch.js`:

```js
import { useMemo, useState } from 'react';

/**
 * Generic client-side search hook.
 * @param {Array} items - The full list to search
 * @param {string[]} fields - Which fields to search across
 * @returns {{ query, setQuery, results }}
 */
export function useSearch(items, fields) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return items || [];
    const lower = query.toLowerCase();
    return (items || []).filter((item) =>
      fields.some((field) => {
        const value = item[field];
        return value != null && String(value).toLowerCase().includes(lower);
      })
    );
  }, [items, query, fields]);

  return { query, setQuery, results };
}
```

---

## 2. Shared SearchBar Component

Create `src/ui/src/components/SearchBar.jsx`:

```jsx
import { FiSearch, FiX } from 'react-icons/fi';

export function SearchBar({ value, onChange, placeholder = 'Søk...' }) {
  return (
    <div className="relative">
      <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-sand bg-white py-2 pl-9 pr-9 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
```

---

## 3. Invoices Page — Search + Status Filter

File: `src/ui/src/pages/InvoicesPage.jsx`

Add search by: `id`, `invoice_number`, `customer`
Add status filter dropdown: All, Utkast, Sendt, Betalt, Forfalt, Kansellert

Changes:
1. Import `useSearch` and `SearchBar`
2. Add a `statusFilter` state (default: `'all'`)
3. Apply both filters to the `invoices` prop before passing to `DataTable`
4. Add a toolbar row between the header and the table containing:
   - `SearchBar` (takes up available space)
   - Status filter dropdown (fixed width, ~160px)
   - Record count: "Viser X av Y fakturaer"

```jsx
// Filter logic
const { query, setQuery, results: searched } = useSearch(invoices, [
  'id', 'invoice_number', 'customer'
]);

const filtered = useMemo(() => {
  if (statusFilter === 'all') return searched;
  return searched.filter((inv) => inv.status === statusFilter);
}, [searched, statusFilter]);
```

Status filter options:
```js
const STATUS_OPTIONS = [
  { value: 'all', label: 'Alle statuser' },
  { value: 'draft', label: 'Utkast' },
  { value: 'sent', label: 'Sendt' },
  { value: 'paid', label: 'Betalt' },
  { value: 'overdue', label: 'Forfalt' },
  { value: 'cancelled', label: 'Kansellert' },
];
```

Use a native `<select>` for the status filter (no custom component needed):
```jsx
<select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
>
  {STATUS_OPTIONS.map((opt) => (
    <option key={opt.value} value={opt.value}>{opt.label}</option>
  ))}
</select>
```

---

## 4. Customers Page — Search + Active Filter

File: `src/ui/src/pages/CustomersPage.jsx`

Add search by: `name`, `contact_name`, `email`, `org_number`
Add active filter: Alle, Aktive, Inaktive

Apply filters to the `customers` prop. Add same toolbar pattern as invoices.

```jsx
const { query, setQuery, results: searched } = useSearch(customers, [
  'name', 'contact_name', 'email', 'org_number'
]);

const filtered = useMemo(() => {
  if (activeFilter === 'all') return searched;
  return searched.filter((c) =>
    activeFilter === 'active' ? c.active : !c.active
  );
}, [searched, activeFilter]);
```

Filter options:
```js
const ACTIVE_OPTIONS = [
  { value: 'all', label: 'Alle kunder' },
  { value: 'active', label: 'Aktive' },
  { value: 'inactive', label: 'Inaktive' },
];
```

---

## 5. Products Page — Search + Active Filter

File: `src/ui/src/pages/ProductsPage.jsx`

Add search by: `name`, `sku`, `description`
Add active filter: Alle, Aktive, Inaktive

Same pattern as customers.

```jsx
const { query, setQuery, results: searched } = useSearch(products, [
  'name', 'sku', 'description'
]);

const filtered = useMemo(() => {
  if (activeFilter === 'all') return searched;
  return searched.filter((p) =>
    activeFilter === 'active' ? p.active : !p.active
  );
}, [searched, activeFilter]);
```

---

## 6. Expenses Page — Search + Category Filter

File: `src/ui/src/pages/ExpensesPage.jsx`

The expenses page already has a category sidebar that filters by category.
Add a search bar above the expense card grid that searches: `vendor`, `notes`

The category sidebar filter already works — just add search on top of it.

```jsx
const { query, setQuery, results: searched } = useSearch(
  filteredExpenses, // already filtered by category
  ['vendor', 'notes']
);
```

Place the `SearchBar` at the top of the right panel (above the card grid).

---

## Acceptance Criteria
- Typing in any search bar immediately filters the list (no submit button)
- Clearing search restores full list
- Status/active filters combine with search (both apply simultaneously)
- Record count updates to reflect filtered results
- Empty state message changes to "Ingen resultater for «{query}»" when filtering returns nothing
- Search is case-insensitive
- Works in both table and card view modes (Customers, Products)
