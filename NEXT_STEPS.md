# 📘 **Fattern: Monetization + Import Strategy + AI Integration — Full Summary**

This document summarizes all decisions and ideas from the moment we began discussing **monetization**, and includes all subsequent conversations about **imports, CSV handling, SAF-T, Mamut migration, and AI features**.

---

# 🧭 1. **Monetization Philosophy & Model**

## ✔ Core emotional/ethical goals

You expressed a very clear philosophical stance:

* You love open-source and giving great tools away for free.
* You want Fattern to be beautiful, polished, and generous.
* You don’t want to lock users out of crucial features.
* You don’t want to implement a complicated licensing backend.
* You don’t want SaaS subscriptions.
* You want to avoid betraying the “local-first, user-owned” spirit.
* But you *also* need a path to monetize ethically — or your wife will kill you.

This leads us to the only monetization model that fits Fattern’s identity:

---

# 💎 2. **Monetization Model: Free Core + Optional Supporter Pack**

### The Fattern app is:

* **Free forever**
* **Fully functional**
* **No restrictions on invoicing, expenses, templates, or data**

### Supporter Pack is:

* **One-time payment**
* **No licensing checks needed**
* **No cloud account required**
* **Stored locally (e.g. a tiny JSON file)**
* **100% optional**

### Supporter Pack includes *non-essential enhancements*:

* Premium invoice templates
* Premium UI themes
* AI-powered features (see below)
* Advanced template editor helpers (snapping, auto-alignment, AI layout)
* Early access features
* A small “Supporter” flair

### Why this model works perfectly:

* Users get a free local-first invoicing tool (rare and precious).
* You avoid SaaS pricing, login systems, and constant maintenance.
* You get a way to earn recurring or at least ongoing revenue ethically.
* You don’t have to cripple your app.
* And it aligns beautifully with the “crafted indie tool” identity.

This is the *exact* model used by successful apps like Obsidian, Raycast, CleanShot X (kind of), and many high-quality open-source-friendly indie tools.

---

# 🧠 3. **AI as a Supporter Feature (perfect fit)**

AI/OCR was explicitly part of your old online Fattern Faktura.
But cloud AI costs money per usage — meaning it cannot be fully free.

We concluded:

## ✔ AI should be a Supporter Pack enhancement.

### AI Features that fit naturally into Supporter Pack:

#### 1. **OCR / Receipt Interpretation**

* Read totals
* Extract VAT
* Detect date
* Detect currency
* Classify expense category
* Suggest vendor name

This *dramatically* accelerates workflows but is not essential.

#### 2. **AI CSV Auto-Mapping**

Using AI to:

* Read headers
* Inspect row samples
* Predict field → column mapping
* Detect date formats
* Fix numeric formatting
* Suggest merges

Again, this is an enhancement, not core functionality.

### Optional future AI features:

* Auto-align elements in template editor (“Make header prettier”)
* Auto-generate invoice layouts
* Suggest categories based on past behavior
* Legacy-import helper (“This CSV looks like Mamut customers”)

AI = expensive to provide
→ AI = perfect paid add-on.

---

# 🔦 4. **Import Strategy: SAF-T as the “Guaranteed Path,” CSV as “Guided Path”**

You realized correctly:
CSV is messy, inconsistent, unpredictable.

But SAF-T is standardized by Norwegian law.

## ✔ SAF-T is the **official supported, reliable import format**.

It provides:

* Customers
* Suppliers
* Sales invoices
* Purchase invoices
* Line items
* Chart of accounts
* General ledger entries

Meaning:
**If a system supports SAF-T export, Fattern can import out of the box.**

This covers:

* Fiken
* Tripletex
* newer Mamut versions
* Visma eAccounting
* Debet
* Conta
* Basically everything modern

### SAF-T importer is absolutely feasible without you having access to real accounts:

* Public SAF-T examples exist
* Government sample files exist
* Accountant communities share samples
* You can test with synthetic valid files

---

# 5. **CSV Import: A Flexible Mapping System**

Because CSV formats differ wildly, we decided CSV should not try to be magical.

### Core CSV import (free version):

* User uploads CSV
* Fattern detects delimiter
* Shows header + sample rows
* User maps columns manually:

  ```
  "Navn" → customer.name
  "Epost" → customer.email
  "OrgNr" → customer.org_number
  ```

### Smart CSV mapping (Supporter feature):

* AI guesses mappings with high accuracy
* Automatically detects:

  * Norwegian vs US date formats
  * Comma vs dot decimal separators
  * Common synonyms (navn, name, customername)
* Suggests full mappings instantly

### CSV Presets

Allow users to save mappings as:

* “Fiken Customers CSV”
* “Conta Products CSV”
* “Mamut Invoices CSV”

This creates long-term simplicity without hardcoding provider rules.

---

# 🟫 6. **Mamut Migration: A Huge Opportunity**

Many Norwegian freelancers still run Mamut on:

* old Windows XP / 7 machines
* systems they bought outright
* outdated hardware they don’t want to touch

They stay because:

* It's offline
* One-time purchase
* Contains years of history
* Fear of losing data
* They don’t want to go SaaS

## Fattern is the *perfect* escape route for them.

### Mamut import plan:

1. CSV import (customers, products, invoices) → easy path
2. SAF-T import (if available in their version) → ideal path
3. (Optional advanced Supporter feature) `.mbk` backup extraction

   * Requires parsing Firebird database
   * 100% optional
   * A high-value paid feature

You don’t need perfect Mamut import on day one.
Your strategy:

> “Fattern supports CSV imports and SAF-T imports.
> If you use Mamut, export CSV or SAF-T and import here.
> Advanced migration tools will come later.”

This is honest, realistic, and correct.

---

# 🟩 7. **No Promise of “Perfect Migration” at Launch**

You avoid the pressure of:

* supporting every provider’s CSV perfectly
* vouching for guaranteed migrations
* maintaining an infinite mapping database

Instead:

* SAF-T = your reliable path
* CSV = guided manual mapping (free)
* AI-mapping = premium enhancement
* Users can submit sample files for future presets
* The importer evolves naturally with the community

This reduces your burden significantly.

---

# 🟦 8. How AI + Import + Monetization All Tie Together Beautifully

This is the really elegant part:

### Free Fattern gets:

* Clean CSV import (manual mapping)
* Full SAF-T import
* Full invoicing
* Full expenses
* Full template editor

### Supporters get:

* AI expense interpretation
* AI CSV auto-mapping
* Possibly advanced Mamut migration tools
* Premium templates
* Premium themes
* Sync unlock later via GESH
* Early access features

This creates:

* A sustainable business model
* A clean moral separation (nothing essential is paywalled)
* A perfect match to local-first philosophy
* A product that feels incredibly generous
* A funding mechanism for costly AI features
* A reason for people to support you voluntarily

---

# 🧱 9. Technical Simplicity of Supporter Pack

No login
No DRM
No online checks
No subscription lifecycle

Supporter license stored locally:

```json
{
  "supporter": true,
  "features": ["ai", "premium_templates", "themes"],
  "ai_credits": 1000
}
```

If people copy it?
Who cares.
Your honest users are the ones who would’ve paid anyway.

---

# 🎯 10. Your Core Audience Loves This Model

Who will be drawn to Fattern?

* Indie workers
* Freelancers
* People who love local-first tools
* People still on Mamut
* People tired of SaaS lock-in
* People who appreciate beautiful software
* People who value privacy

These people *love* paying for supporter packs.
Not because they must — but because they **want** to support indie craftsmanship.

---

# ⭐ Final Summary Sentence

You are building a **beautiful, modern, local-first invoicing app**, free at its core, ethically monetized through optional enhancements like AI/OCR and premium templates, with reliable SAF-T import support, flexible CSV mapping, and potential for high-value legacy migration features — forming a sustainable, philosophy-aligned ecosystem that never compromises user freedom.