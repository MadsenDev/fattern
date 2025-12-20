# **Fattern Template Engine + Visual Editor Specification (Standalone Module Spec)**

This document describes *everything* required for the **invoice template system** inside Fattern.

It covers:

* Template engine architecture
* Template JSON format
* Rendering pipeline
* Visual editor (full-screen overlay)
* UI layout
* Canvas behavior
* Zooming, panning, snapping
* Element types
* Export → PDF generation
* Undo/redo and saving
* Future extensions

This is the canonical source of truth for how the Template Editor works.

---

# 1. **Purpose**

The Template Editor allows users to design **pixel-perfect invoice layouts** that render identically when exported to PDF.

Core goals:

* True **WYSIWYG** (what you see is what you get).
* HTML/CSS rendering inside Electron, using Chromium for both preview and PDF.
* A modular JSON template definition storing layout + fields.
* A visual editor where users can drag, position, style, and configure elements.

---

# 2. **High-Level Architecture**

## 2.1 Components

### **Template JSON Model**

Defines:

* Page size & margins
* Elements (absolute-positioned blocks)
* Styles
* Field bindings

### **HTML Renderer**

Converts JSON → HTML/CSS
Responsibilities:

* Generate a static invoice HTML from template + data
* Generate a preview version for the editor
* Render using Chromium for perfect export matching

### **Editor UI (React)**

A full-screen overlay where the user:

* Edits template structure visually
* Drags/resizes elements
* Inserts dynamic fields
* Controls typography/style
* Saves the JSON

### **PDF Export Module**

Uses `BrowserWindow.printToPDF()` to export the template with actual invoice data.

---

# 3. **Template Editor UI / Interaction Model**

The Template Editor is a **full-screen overlay** that covers the entire app including sidebar/navigation.

It is *not* a modal dialog — it is its own “mode”.

Route example:

```
/templates/:templateId/edit
```Y

## 3.1 Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Top Bar: Back | Template Name | Undo/Redo | Zoom Controls | Save         │
├──────────────────────────────────────────────────────────────────────────┤
│ Palette (left) | Canvas (center, with A4 artboard) | Properties (right)  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

# 4. **Canvas Behavior (Critical)**

The artboard represents the real printed page (usually A4).

### 4.1 Scaling & Zoom

* Canvas has a **logical fixed size** (e.g., 794×1123 px for A4 at 96 DPI).
* The user can zoom:

  * 50%, 75%, 100%, 150%, 200%
* Zoom controls at top bar:

  * `[-] 50% 75% 100% 150% 200% [+]`
  * “Fit width” button is optional.

### 4.2 Panning

* Drag middle mouse or space+drag to pan.
* Canvas is inside a viewport; the viewport does not scroll like a webpage.
* Panning moves the artboard within the viewport.

### 4.3 Snapping & Guides

* Snap to:

  * Grid (8px or 10px)
  * Neighbor element edges
  * Center lines
* Rulers (optional v2 feature)

### 4.4 Hitboxes

* Elements have selection boxes and resize handles.
* Dragging an element moves it.
* Resizing changes width/height where appropriate.

---

# 5. **Element Types**

At minimum:

### 5.1 TEXT

Static text block.

Fields:

* `content` (string)
* `x`, `y`, `width`, `height`
* `fontFamily`, `fontSize`, `fontWeight`, `color`, `align`

### 5.2 FIELD

Dynamic placeholder bound to invoice/company/customer.

Fields:

* `binding` (e.g., `"invoice.number"`)
* All text styling fields above
* `content` is displayed as placeholder preview in editor

### 5.3 IMAGE

For logos, stamps, etc.

Fields:

* `src` (image in template package)
* `x`, `y`, `width`, `height`
* `preserveAspectRatio` option

### 5.4 TABLE (line items)

Repeating rows for invoice items.

Fields:

* `binding`: `"invoice.items"`
* `columns`: [

  * `{ header: "Description", field: "description", width: xxx, align: "left" }`
  * …
    ]
* Row height
* Max rows
* Overflow behavior: (truncate, shrink rows, continue on page)

### 5.5 SHAPE (optional v1, easy to add)

Horizontal/vertical lines or rectangles.

---

# 6. **Template JSON Structure (v1)**

A template is defined as:

```json
{
  "id": "default_invoice",
  "name": "Default Invoice",
  "page": {
    "size": "A4",
    "margin": {
      "top": 40,
      "left": 40,
      "right": 40,
      "bottom": 40
    },
    "background": null
  },
  "elements": [
    {
      "id": "title_1",
      "type": "text",
      "x": 40,
      "y": 40,
      "width": 300,
      "height": 40,
      "content": "FAKTURA",
      "fontFamily": "Inter",
      "fontSize": 28,
      "fontWeight": 600,
      "color": "#000",
      "align": "left"
    },
    {
      "id": "field_number",
      "type": "field",
      "binding": "invoice.number",
      "x": 40,
      "y": 100,
      "width": 200,
      "height": 20,
      "fontFamily": "Inter",
      "fontSize": 14,
      "fontWeight": 400,
      "color": "#000",
      "align": "left"
    },
    {
      "id": "items_table",
      "type": "table",
      "binding": "invoice.items",
      "x": 40,
      "y": 200,
      "columns": [
        { "header": "Description", "field": "description", "width": 250, "align": "left" },
        { "header": "Qty", "field": "quantity", "width": 50, "align": "right" },
        { "header": "Price", "field": "unit_price", "width": 80, "align": "right" },
        { "header": "Total", "field": "line_total", "width": 80, "align": "right" }
      ],
      "rowHeight": 18,
      "maxRows": 15
    }
  ]
}
```

Each element has a unique ID and is absolute-positioned.

---

# 7. **Editor UI Details**

## 7.1 Full-screen Overlay Behavior

* Covers the entire app.
* Underlying app is non-interactive.
* Escape key prompts to save/discard changes.

## 7.2 Top Bar

Contains:

* Back button
* Template name
* Undo / Redo
* Zoom control
* Save button (and autosave optional)

## 7.3 Palette (Left Sidebar)

Buttons for inserting:

* Text
* Field
* Table
* Image
* Shape

When adding FIELD, a dropdown appears:

* invoice.number
* invoice.date
* invoice.due_date
* customer.name
* company.org_number
* etc.

## 7.4 Properties Panel (Right Sidebar)

When an element is selected:

General:

* X, Y
* Width, Height
* Hidden toggle (if needed)
* Lock position toggle (optional)

Text/field:

* Font family
* Font size
* Weight
* Color
* Alignment (left, center, right)
* Line height (optional)

Field:

* Binding dropdown

Image:

* Source picker
* “Preserve aspect ratio” checkbox

Table:

* Editable columns list
* Column resizing
* Header styling
* Row height
* Max rows
* Border options

---

# 8. **Rendering Pipeline**

## 8.1 Editor Preview Rendering

Editor preview uses the same HTML/CSS as the PDF export but wrapped in:

* Selection outlines
* Transparent bounding boxes
* Drag/resize handles

The HTML structure is injected into a component for preview.

## 8.2 PDF Export Rendering

1. Load template JSON.
2. Merge it with actual invoice data.
3. Render HTML/CSS via hidden BrowserWindow.
4. Call `printToPDF({ pageSize: 'A4' })`.
5. Save resulting PDF.

Same rendering engine → identical output.

---

# 9. **Undo / Redo**

Must support undo/redo for:

* Adding/removing elements
* Moving/resizing
* Editing text
* Changing styles
* Changing bindings

Use a simple history stack:

* `past[]`
* `present`
* `future[]`

---

# 10. **Saving Templates**

Templates are stored as:

```
~/Fattern/data/templates/{id}.json
```

The user can:

* Modify built-in templates by duplicating them
* Create new templates
* Set a default template for new invoices

---

# 11. **Future Extensions (Not required now)**

### Import PDF as background

* For tracing existing designs.

### Multi-page templates

* For terms & conditions pages.

### Component-level snapping, grouping

* Like “Group elements” or “Distribute horizontally”.

### Custom fonts

* Let user install fonts or import OTF/TTF.

---

# 12. **MVP Version (required)**

For v1 of the template editor, Codex should implement:

* Full-screen overlay editor with back/save behavior
* Canvas with zoom + pan
* Ability to add/move/edit:

  * Text
  * Field
  * Image
  * Table
* Properties panel
* JSON template persistence
* HTML/CSS renderer
* PDF export pipeline
* Undo/redo
* Snapping grid
* Keyboard support:

  * Delete element
  * Arrow keys nudge

Everything else can be added later.