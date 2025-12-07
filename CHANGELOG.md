# Changelog

All notable changes to Fattern will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Import & Export System
- **Supporter Pack System**: Local storage-based supporter pack with feature flags (`useSupporterPack` hook)
  - Feature checking (`hasFeature`)
  - AI credits tracking
  - Activation system
- **CSV Import**: Full CSV import functionality with manual column mapping
  - CSV parser with automatic delimiter detection (comma, semicolon, tab)
  - CSV import modal with step-by-step workflow (upload → mapping → preview → import)
  - Bulk create methods for customers and products (`bulkCreateCustomers`, `bulkCreateProducts`)
  - Type conversion for numeric fields (prices, VAT rates, percentages)
  - Support for AI auto-mapping (Supporter Pack feature, UI ready)
  - Preview of first 5 rows before import
- **CSV Presets**: Storage system for saving and loading common CSV mappings (`csvPresets.js`)
- **SAF-T Import Structure**: Basic infrastructure for SAF-T file import (parser structure created, implementation pending)
- **Import Section in Settings**: New "Import" category in Settings page with CSV and SAF-T import options
- **Premium Template Support**: Added `premium` field to template structure

### Changed
- Settings page now includes Import section with CSV and SAF-T import options
- Database now supports bulk operations for customers and products
- Added new IPC handlers: `db:bulk-create-customers`, `db:bulk-create-products`

### Technical Details
- New utilities: `csvParser.js`, `csvPresets.js`, `saftParser.js`
- New components: `CSVImportModal`
- New hooks: `useSupporterPack`
- Database methods: `bulkCreateCustomers`, `bulkCreateProducts`

### Added

#### Design System
- Created design system based on colors extracted from `fattern-monogram.svg`
- Defined brand color palette (`brandCore`, `brandScale`) in Tailwind config
- Added custom color scales: `ink`, `accent`, `moss`, and neutrals (`cloud`, `mist`, `sand`, `foam`, `tide`)
- Updated global CSS with new color scheme and scrollbar styling
- Applied design system across all components

#### Application Structure
- Implemented full-width Electron app layout (removed centered design)
- Created fixed sidebar that doesn't scroll with content
- Integrated `fattern-monogram.svg` into sidebar hero section
- Set up multi-page routing system with `Layout` and `Sidebar` components
- Created reusable `Layout` component for consistent page structure

#### Loading & Onboarding
- Added animated loading screen with progress bar
- Implemented onboarding flow for initial company setup
- Onboarding stores company information in database
- Loading screen shows during app initialization

#### Dashboard
- Created dashboard view with statistics highlights
- Implemented stat cards with different tone variants (default, accent, muted, soft)
- Added budget year selector at top of dashboard
- Display of income, expenses, overdue, unpaid amounts
- Utilization and collection rate metrics
- Activity feed and client highlights sections
- Budget year cards with date ranges

#### Budget Years
- Full CRUD functionality for budget years
- Create, edit, and delete budget years
- Set active/current budget year
- Budget year modal with date pickers
- Validation and error handling
- Prevention of deleting active budget year

#### Products
- Full CRUD functionality for products
- Product modal for creating and editing
- Fields: name, SKU, description, unit price, VAT rate, unit, active status
- Custom unit select component with common units and custom option
- Image upload support with preview
- List/table view and card view toggle
- Product cards with images and key information
- Deactivate option (safer than delete) in confirmation modal
- Status badges (Active/Inactive)
- Responsive grid layout for card view

#### Customers
- Full CRUD functionality for customers
- Customer modal for creating and editing
- Fields: name, contact person, email, phone, address, post number, post location, org number
- VAT exempt and active status checkboxes
- Image upload support with preview
- List/table view and card view toggle
- Customer cards with images and contact information
- Initial letter avatar when no image is provided
- Status badges (Active/Inactive)
- Responsive grid layout for card view

#### Pages
- **Invoices Page**: Table view of all invoices with status badges, full CRUD functionality
- **Expenses Page**: Table view of all expenses
- **Products Page**: List/card view toggle with full CRUD
- **Customers Page**: List/card view toggle with full CRUD
- **Settings Page**: Company information display and editable fields
- **Template Editor Page**: Visual invoice template editor with canvas, properties panel, and preview

#### Components
- **Modal**: Reusable modal component with title, description, footer
- **ConfirmModal**: Custom confirmation dialog (replaces native prompts)
  - Support for danger, warning, and info variants
  - Optional deactivate button for safer alternatives to deletion
- **DataTable**: Reusable table component with configurable columns
  - Sortable columns by clicking headers
  - Visual sort indicators (up/down arrows)
  - Custom sort functions for dates, numbers, and complex data types
  - Default sorting support
- **StatCard**: Statistics display cards with different tone variants
- **Section**: Reusable section wrapper component
- **ImageUpload**: Image upload component with preview and validation
- **Select**: Custom select component built with divs (no native select)
- **UnitSelect**: Specialized select for product units with common options
- **ProductCard**: Card component for product display in grid view
- **CustomerCard**: Card component for customer display in grid view
- **Sidebar**: Fixed sidebar component with navigation
- **Layout**: Page layout wrapper with sidebar integration
- **TitleBar**: Custom Electron title bar with window controls
  - Shows app name "Fattern" with logo
  - Window minimize, maximize, close controls
  - Developer tools toggle button
- **Toast**: Notification system with auto-dismiss
  - Progress bar showing remaining time
  - Slide-in/out animations
  - Success, error, warning, and info variants
  - Configurable auto-dismiss duration
- **InvoiceModal**: 3-panel invoice editor (Customers, Invoice Content, Products)
- **StatusBadge**: Reusable status indicator component
- **Checkbox**: Custom checkbox component matching design system
- **TimelineModal**: Chronological view of all financial events
- **TemplateCanvas**: Visual canvas for template element editing
- **TemplatePalette**: Sidebar for adding template elements
- **TemplateProperties**: Properties panel for editing element attributes
- **TemplatePreview**: Preview mode for templates

#### Utilities
- `formatCurrency`: Currency formatting utility
- `formatDate`: Date formatting to `dd.mm.yyyy` format
- `imageUpload`: Image validation and conversion utilities
- Auto-formatting date inputs to `dd.mm.yyyy` with automatic dot insertion
- `templateRenderer`: HTML/CSS renderer for invoice templates
- `useToast`: React hook for toast notifications
- `useTemplateHistory`: Undo/redo functionality for template editor

#### Database
- Added `image_path` column to `products` table
- Added `image_path` column to `customers` table
- Migration logic for adding new columns to existing databases
- Database methods for product and customer CRUD operations
- Support for storing image data as base64 data URLs

#### Backend Integration
- IPC handlers for all database operations
- Preload script exposing database API to renderer
- Custom React hooks for data fetching:
  - `useDashboardData`: Dashboard statistics and metadata
  - `useInvoices`: Invoice listing with optional limit
  - `useExpenses`: Expense listing with optional limit
  - `useCustomers`: Customer listing with refresh support
  - `useProducts`: Product listing with refresh support
  - `useSettings`: Settings management with persistence
- IPC handlers for PDF generation (invoice and template-based)
- IPC handlers for template management (list, load, save, delete, duplicate)
- IPC handlers for template image file management

#### Invoices
- Full CRUD functionality for invoices
- 3-panel invoice modal (Customers, Invoice Content, Products)
- Invoice line items management with product selection
- Automatic invoice calculations (subtotal, VAT, total)
- Invoice status management (draft, sent, paid, overdue, cancelled)
- Status icons and badges throughout the app
- PDF generation for invoices (default and template-based)
- Invoice numbering system
- Date validation and budget year filtering
- Toast notifications for invoice operations

#### Invoice Templates
- Visual template editor with drag-and-drop canvas
- Template element types: Text, Field, Image, Table
- Element properties panel with tabbed interface
- Typography controls (font, size, weight, color, alignment, line height, letter spacing)
- Styling options (background, border, padding, shadow, opacity)
- Table-specific styling (header colors, row colors)
- Image file storage (separate from template JSON)
- Grid snapping and pan/zoom functionality
- Undo/redo support
- Keyboard shortcuts
- Preview mode with shared pan/zoom state
- Template storage in `~/Fattern/data/templates/`
- PDF export using Electron's printToPDF

#### Localization
- Set up i18n framework (`i18next`, `react-i18next`)
- Created translation file structure (`en.json`, `no.json`)
- Locale detection from system
- Currently using Norwegian (bokmål) as primary language

### Changed
- Redesigned app layout from centered website-style to full-width desktop app
- Updated all date displays to `dd.mm.yyyy` format
- Replaced native browser prompts with custom confirmation modals
- Refactored `App.jsx` to use component-based architecture
- Moved from mock data to live database queries
- Updated sidebar to be fixed position with proper scrolling
- Improved toast notification system with auto-dismiss and progress indicators
- Enhanced table UX with sortable columns and visual indicators
- TitleBar now shows app name "Fattern" with logo instead of company name
- Template images now stored as files instead of base64 in JSON

### Technical Details
- All dates stored in ISO format (`yyyy-mm-dd`) in database
- Dates displayed as `dd.mm.yyyy` in UI
- Date inputs auto-format with dot insertion (dd.mm.yyyy)
- Images stored as base64 data URLs in database
- Quantity fields support decimals (including values < 1)
- Custom select components for better design customization

## [0.1.0] - Initial Release

### Added
- Initial project setup
- Electron + React + Vite + TailwindCSS stack
- SQLite database with schema
- Basic UI structure

