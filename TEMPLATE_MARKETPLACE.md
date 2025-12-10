## Goal

Make Fattern’s template system ready for a future marketplace **without** actually building the marketplace yet.

That means:

* Templates are **self-contained, portable artifacts** (can be shared/sold).
* The app can **import/export** templates as single files.
* Templates have **metadata** (author, version, license, etc).
* The engine can **validate/version-check** templates cleanly.
* There are **UI hooks** for premium/third-party templates later.

---

## 1. Define a stable template data model

Create a clear interface/type for templates that everything uses (renderer, editor, importer, exporter).

**Task: introduce a `TemplateDefinition` + `TemplateMeta` type.**

Example (TS-ish, even if codebase is JS you can use JSDoc):

```ts
export type TemplateMeta = {
  id: string;                     // stable identifier, e.g. "nordic-clean"
  name: string;                   // human name
  description?: string;
  author?: string;                // template creator
  authorUrl?: string;
  version: string;                // template version, e.g. "1.0.0"
  minAppVersion?: string;         // e.g. "0.6.0"
  createdAt?: string;             // ISO date
  updatedAt?: string;
  tags?: string[];                // ["minimal", "norsk", "engelsk"]
  premium?: boolean;              // used for Supporter/marketplace gating
  license?: string;               // optional (e.g. "commercial-use")
  previewImage?: string;          // path or data URL (relative to template dir)
};

export type TemplateDefinition = {
  meta: TemplateMeta;
  page: {
    size: "A4" | "Letter";
    margin: { top: number; right: number; bottom: number; left: number };
    background?: string | null;
  };
  elements: Array<TemplateElement>; // whatever you already use (text/field/table/image/shape)
};
```

**Cursor:**

* Find the existing template JSON structure.
* Refactor it so every template has a `meta` block.
* Ensure renderer & editor both use `TemplateDefinition` as the single source of truth.

---

## 2. Standardize on a template folder structure

We need a predictable structure on disk so packaging is easy.

**Target structure:**

```txt
~/Fattern/data/templates/
  default/
    template.json         // TemplateDefinition
    preview.png           // optional preview
    assets/
      logo.png
      bg.png
  nordic-clean/
    template.json
    preview.png
    assets/
      logo.svg
  ...
```

**Cursor:**

* Ensure template loading & saving always use:
  `TEMPLATE_BASE_DIR/<templateId>/template.json`
* Make image paths **relative** to the template root:

  * e.g. `assets/logo.svg` rather than absolute paths.
* Update the template editor’s image picker to save assets into `assets/` under that template’s folder.

---

## 3. Define a portable template package format

We want a file a creator can share/sell, like `nordic-clean.fattern-template`.

**Simplest approach:**

* A `.zip` file with:

  * `template.json`
  * `preview.png` (optional)
  * `assets/` folder (optional)

**Cursor:**

* Implement helper functions:

```ts
// pseudo signatures
export async function exportTemplateToPackage(templateId: string, outputPath: string): Promise<void>;
export async function importTemplateFromPackage(packagePath: string): Promise<TemplateMeta>;
```

Implementation details:

* `exportTemplateToPackage`:

  * Read `~/Fattern/data/templates/<id>/`.
  * Zip the folder contents.
  * Write to `outputPath` with extension `.fattern-template`.

* `importTemplateFromPackage`:

  * Unzip into a **temporary folder**.
  * Validate structure (must have `template.json`).
  * Read `meta.id`; if it clashes with an existing template, either:

    * ask user to rename in the UI, or
    * auto-rename to `<id>-imported-N`.
  * Copy into `~/Fattern/data/templates/<finalId>/`.
  * Return the `TemplateMeta` for UI display.

Use any existing Node/Electron zip library you prefer; the exact lib isn’t important yet.

---

## 4. Add template validation & compatibility checks

Before we trust third-party templates, we need a validator.

**Cursor:**

* Implement a validator function:

```ts
export type TemplateValidationIssue = {
  path: string;          // e.g. "meta.name" or "elements[3].table.columns[1]"
  message: string;
  level: "error" | "warning";
};

export function validateTemplate(def: TemplateDefinition, currentAppVersion: string): TemplateValidationIssue[];
```

Validation rules (minimal set):

* `meta.id`, `meta.name`, `meta.version` required.
* `meta.version` must be SemVer-like.
* If `meta.minAppVersion` > current app version → error or warning.
* `page.size` in allowed set.
* Every element has:

  * `id`, `type`, `x`, `y`, `width`, `height` within reasonable bounds.
* Images:

  * `src` paths must be under `assets/`.

**When to use it:**

* On **import** of a `.fattern-template` file.
* On **template save** in the editor (can surface warnings in dev panel for now).

---

## 5. Extend the Templates UI for import/export & metadata

We already have a Templates tab in Settings. Make it marketplace-ready:

**Templates list:**

* Show:

  * Name
  * `meta.author` (if present)
  * `meta.version`
  * `meta.tags`
  * `premium` badge if `meta.premium === true`
* Actions per template:

  * Set as default
  * Edit
  * Duplicate
  * Delete
  * **Export** (new)

**Global actions:**

* `Import mal` (button) → opens file picker → calls `importTemplateFromPackage`.

**Cursor:**

* Add a new “Import template” flow in the Templates page:

  * Pick `.fattern-template`.
  * Run validator.
  * Show a confirmation dialog with:

    * Name
    * Author
    * Version
    * Tags
    * Any warnings/errors.
  * On confirm: install template.

* Add “Export” button per template:

  * Save `.fattern-template` to user-chosen location.

---

## 6. Lock premium templates using meta + Supporter pack

To make it marketplace-friendly, we need a way to mark templates as “locked unless supporter / purchased”.

We already have `meta.premium`.

**Cursor:**

* In template list:

  * If `meta.premium === true` and user does **not** have the right feature flag:

    * Show template as **locked** (e.g. lock icon).
    * Prevent “Set as default”.
    * Allow “Preview” (optional) but not “Use”.

* In template selection UI (when picking template for invoice):

  * Same gating:

    * Free templates: selectable.
    * Premium templates: show lock + “requires Supporter pack”.

This lays the groundwork for:

* Bundled premium templates in the Supporter Pack.
* Later: templates linked to marketplace purchases (via additional metadata).

---

## 7. Keep template schema versioned & forward-compatible

To support third-party templates, template creators need stability.

**Cursor:**

* Add a `schemaVersion` to `template.json` (in `meta` or root):

```ts
export type TemplateDefinition = {
  schemaVersion: 1;
  meta: TemplateMeta;
  // ...
};
```

* When loading:

  * If `schemaVersion` is missing: assume `1` (for now).
  * If `schemaVersion` is greater than supported: show error & avoid loading.

This way, future breaking changes to template format can be handled gracefully, and docs for creators can say:

> “Fattern 0.6 uses template schemaVersion 1”

---

## 8. Keep everything local (for now), but add future hooks

We’re **not** building the marketplace backend yet — but we can add hooks.

**Cursor:**

* Wherever you list templates in the UI, design the code so the data comes from a `TemplateRegistry` abstraction, e.g.:

```ts
export type TemplateSource = "local" | "bundled" | "marketplace";

export type TemplateRegistryItem = TemplateDefinition & {
  source: TemplateSource;
  installedFromPackage?: string;  // optional, future use
};
```

* Right now:

  * `source` can be `"local"` or `"bundled"`.
* Later:

  * When marketplace exists, `"marketplace"` templates can be synced/installed, but the rest of the app doesn’t care.

---

## 9. Summary of concrete tasks for Cursor

1. **Refactor template data model**

   * Introduce `TemplateMeta`, `TemplateDefinition`, `schemaVersion`.
   * Ensure renderer & editor use them.

2. **Standardize file structure**

   * `~/Fattern/data/templates/<id>/template.json`
   * `assets/`, `preview.png` support.

3. **Implement package import/export**

   * `.fattern-template` (zip) with `template.json`, optional `preview.png`, `assets/`.

4. **Add validation**

   * `validateTemplate(def, currentVersion)` with basic structural checks.

5. **Update Templates UI**

   * Import/export buttons.
   * Metadata display (author, version, premium).
   * Lock premium templates via `meta.premium`.

6. **Wire into Supporter Pack**

   * Use existing `useSupporterPack` / feature flags to gate premium templates.

7. **Keep schema versioned**

   * `schemaVersion: 1` and checks on load.

Once these are in place, the app is **fully “template marketplace ready”**: creators can build portable templates, you can ship premium packs, and in the future you can add a real marketplace backend without reworking the core template system.