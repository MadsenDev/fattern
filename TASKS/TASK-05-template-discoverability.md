# TASK 05 — Template Editor Discoverability & Invoice Multi-Page Support

## Context
Fattern is a local-first Electron + React + SQLite invoicing app.
The WYSIWYG template editor is the most impressive feature in the app but is buried
three clicks deep in Innstillinger → Maler. Most users will never find it.

This task makes the template editor discoverable and adds basic multi-page support
so invoices with many line items don't silently truncate.

---

## Part 1 — Template Discoverability

### 1a. First PDF generation prompt

The first time a user generates a PDF, show a non-blocking toast or banner that says:
"Visste du at du kan tilpasse fakturaens utseende? Rediger mal →"

Implement using a one-time flag in SQLite settings:

```js
// In the PDF generation handler in src/electron/main.js
// After successful PDF generation, check if we've shown the template hint
const hasShownTemplateHint = database.getSetting('ui.hasShownTemplateHint', 'false');
if (hasShownTemplateHint !== 'true') {
  database.setSetting('ui.hasShownTemplateHint', 'true');
  // Return a flag in the result so the UI can show the hint
  return { success: true, filepath, showTemplateHint: true };
}
return { success: true, filepath };
```

In `src/ui/src/App.jsx`, in `handleViewInvoiceGeneratePDF`:
```js
if (result?.showTemplateHint) {
  toast.info('Tips: Tilpass fakturaens utseende i Innstillinger → Maler');
}
```

### 1b. Template picker on invoice PDF generation

In `src/ui/src/components/invoices/InvoiceViewModal.jsx`, replace the single
"Last ned PDF" button with a split button:

- Primary action: "Last ned PDF" (uses current default template)
- Secondary action: a small dropdown arrow that opens a template picker

The template picker:
- Fetches available templates via `window.fattern.template.list()`
- Shows template names with a preview thumbnail (use the iframe preview already in `TemplateCard`)
- Shows a lock icon for premium templates if user is not a supporter
- On selection, generates PDF with that template and optionally sets it as new default

```jsx
// Simplified split button pattern
<div className="flex">
  <button
    onClick={handleGeneratePDF}
    className="rounded-l-2xl bg-brand-700 px-4 py-2 text-sm font-medium text-white"
  >
    Last ned PDF
  </button>
  <button
    onClick={() => setShowTemplatePicker(!showTemplatePicker)}
    className="rounded-r-2xl border-l border-brand-800 bg-brand-700 px-2 py-2 text-white"
  >
    <FiChevronDown className="h-4 w-4" />
  </button>
</div>
```

### 1c. Template quick-access in Settings sidebar

In `src/ui/src/components/settings/SettingsSidebar.jsx`, add a visual indicator
on the "Maler" category item showing the count of available templates:

```jsx
// In the sidebar item for 'templates':
<span className="ml-auto text-xs text-ink-subtle">{templateCount}</span>
```

Load template count from `window.fattern.template.list()` in a `useEffect` when
the sidebar renders.

---

## Part 2 — Invoice Multi-Page Support

### The problem
The `items_table` element in templates has a `maxRows` property (default 15).
If an invoice has more line items than `maxRows`, they are silently cut off in the PDF.
There is no warning and no overflow to a second page.

### Solution: Overflow detection and warning

**Step 1 — Warn during PDF generation**

In `src/electron/main.js`, in the PDF generation handler, before calling
`generateTemplatePDF` or `generateInvoicePDF`, check if the invoice has more
items than the template's table `maxRows`:

```js
// Check for item overflow
const tableElement = template?.elements?.find((el) => el.type === 'table');
const maxRows = tableElement?.maxRows || 15;
const itemCount = invoice.items?.length || 0;
const hasOverflow = itemCount > maxRows;

const result = { success: true, filepath };
if (hasOverflow) {
  result.warning = `Fakturaen har ${itemCount} linjer men malen viser maks ${maxRows}. ${itemCount - maxRows} linjer ble ikke inkludert i PDF-en.`;
}
return result;
```

In the UI, show this warning as a toast after PDF generation:
```js
if (result?.warning) {
  toast.warning(result.warning);
}
```

**Step 2 — Auto-expand maxRows in default generator**

In `src/electron/pdfGenerator.js` (the fallback PDFKit generator), remove the
implicit row limit. The PDFKit generator already handles multi-page because PDFKit
adds new pages automatically. Verify this works correctly — if the table rendering
in `pdfGenerator.js` has a hardcoded row limit, remove it.

**Step 3 — Multi-page in template PDF generator**

In `src/electron/templatePdfGenerator.js`, the `renderTable` function slices
items to `maxRows`. For the PDF export path (not the preview), implement overflow:

```js
function renderTable(element, data, baseStyle) {
  const items = resolveBinding(element.binding, data) || [];
  const columns = element.columns || [];
  const maxRows = element.maxRows || 15;
  const rowHeight = element.rowHeight || 18;

  // For PDF generation, render ALL items and let printToPDF handle pagination
  // Remove the slice — just use all items
  const visibleItems = items; // was: items.slice(0, maxRows)

  // ... rest of table rendering unchanged
}
```

Note: `printToPDF` with `pageSize: 'A4'` and zero margins will automatically
create new pages when content overflows. The absolute positioning of elements
in the template will still work correctly for the header/footer elements on
the first page, but they won't repeat on subsequent pages. That's acceptable
for v1 — document this limitation.

**Step 4 — Add overflow indicator to template editor**

In `src/ui/src/components/template/TemplateCanvas.jsx`, when a table element
is selected and the invoice being previewed has more items than `maxRows`, show
a small warning badge on the element:

```jsx
// In renderElement for 'table' type:
<div className="h-full w-full border-2 border-dashed border-sand/60 bg-cloud/50">
  <div className="border-b border-sand/60 bg-cloud/50 p-1 text-xs font-semibold text-ink">
    Tabell: {element.binding || 'invoice.items'}
  </div>
  <div className="p-2 text-xs text-ink-subtle">
    {element.columns?.length || 0} kolonner · maks {element.maxRows || 15} rader
  </div>
</div>
```

---

## Part 3 — Template Editor UX Polish

These are small improvements while touching the template editor:

### 3a. Auto-save
In `src/ui/src/pages/TemplateEditorPage.jsx`, auto-save 2 seconds after the
last change using a debounced effect:

```js
useEffect(() => {
  if (!template) return;
  const timeout = setTimeout(() => {
    handleSave();
  }, 2000);
  return () => clearTimeout(timeout);
}, [template]);
```

Show a subtle "Lagret" / "Lagrer..." indicator in the top bar next to the Save button.

### 3b. Element duplication
Add a "Dupliser" button to the properties panel when an element is selected.
Clicking it creates a copy of the selected element offset by 10px in both directions.

```js
const handleDuplicateElement = () => {
  if (!selectedElementId) return;
  const original = template.elements.find((el) => el.id === selectedElementId);
  if (!original) return;
  const copy = {
    ...original,
    id: `element_${Date.now()}`,
    x: original.x + 10,
    y: original.y + 10,
  };
  handleUpdateTemplate((prev) => ({
    ...prev,
    elements: [...prev.elements, copy],
  }));
  setSelectedElementId(copy.id);
};
```

### 3c. Keyboard shortcut for save
In `src/ui/src/pages/TemplateEditorPage.jsx`, add Ctrl+S / Cmd+S to trigger save:

```js
useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [template]);
```

---

## Acceptance Criteria

**Discoverability:**
- First PDF generation shows a one-time hint about the template editor
- Invoice view modal has a template picker accessible via split button
- Template picker shows all templates with names and lock state
- Settings sidebar shows template count badge

**Multi-page:**
- Invoices with more items than `maxRows` generate a PDF containing all items
- A warning toast appears when overflow is detected
- The warning message is in Norwegian and states exactly how many lines were cut (if using template generator) or confirms all lines are included (if using PDFKit fallback)
- Template editor canvas shows maxRows count on table elements

**Editor polish:**
- Auto-save triggers 2 seconds after last change
- Save indicator shows "Lagrer..." during save and "Lagret" after
- Selected elements can be duplicated via button in properties panel
- Ctrl+S saves the template
