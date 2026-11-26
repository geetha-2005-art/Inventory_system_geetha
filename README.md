# Inventory Management System (React POC)

A single-page React application to manage products, stock receipts, stock issues, stock
adjustments, low-stock alerts and inventory reports. All data is stored in the browser's
localStorage. No backend or database is used.

## Features
- Dashboard: 6 KPIs, a stock-by-category donut chart and a replenishment list
- Product, Category and Supplier management (add, edit, deactivate; nothing is deleted)
- Stock In, Stock Out and Stock Adjustment with business-rule validation
- Immutable transaction history with filters, sorting and pagination
- Current Stock, Stock Movement and Low Stock reports; CSV export matches the applied filters
- Sample data (20 products, 5 categories, 5 suppliers, 50 transactions) loaded on first run only
- Data persists after refresh; missing or corrupted storage is handled without overwriting data

## Screens and routes
| Screen | ID | Route |
|---|---|---|
| Dashboard | INV-01 | / |
| Product List | INV-02 | /products |
| Add / Edit Product | INV-03 | /products/new, /products/:id/edit |
| Product Details | INV-04 | /products/:id |
| Category Management | INV-05 | /categories |
| Supplier Management | INV-06 | /suppliers |
| Stock In | INV-07 | /stock-in |
| Stock Out | INV-08 | /stock-out |
| Stock Adjustment | INV-09 | /stock-adjustment |
| Transaction History | INV-10 | /transactions (optional ?product=ID) |
| Low Stock Report | INV-11 | /reports?report=low-stock |
| Inventory Reports | INV-12 | /reports (Current Stock, Stock Movement, Low Stock tabs) |

## Tech stack
| Layer | Technology | Licence |
|---|---|---|
| Frontend | React with JavaScript | MIT |
| Build tool | Vite | MIT |
| UI components | MUI (Material UI) Core | MIT |
| Routing | React Router | MIT |
| State | React Hooks | - |
| Charts | Recharts | MIT |
| Storage | Browser localStorage | - |

## Prerequisites
- Node.js 20.19 or higher (or 22.12+) and npm
- A modern browser (tested on Google Chrome)

## Install and run
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Other commands
```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run lint      # code check
```

## Reset to sample data
Open the browser console (F12 > Console), run `localStorage.clear()` and refresh the page.

## Quick demo path
1. Dashboard: check the KPIs and the replenishment list
2. Products > Add Product (try empty and duplicate-code errors first)
3. Stock In, then Stock Out (try issuing more than the available stock)
4. Stock Adjustment (enter the physical count; the difference is calculated)
5. Transactions: filter by product and type; note there are no edit or delete buttons
6. Reports: apply a filter and export CSV; refresh the browser to confirm persistence

## Project structure
```
src/
  components/   reusable UI (dialogs, chips, cards, tables, chart)
  layout/       main layout, header, sidebar, navigation config
  pages/        one file per screen (+ reportViews/ for the three reports)
  services/     localStorage access and business logic
  utils/        calculations, validation, CSV, formatting, dates
  hooks/        useNotification, useSortedRows
  data/         sample (seed) data
  theme.js      MUI theme (colours, typography, component styles)
docs/           requirement understanding, navigation flow, components and storage,
                test cases, assumptions, known issues, screenshots
```

## Data storage
| Data | localStorage key |
|---|---|
| Products | inventory_products |
| Categories | inventory_categories |
| Suppliers | inventory_suppliers |
| Transactions (opening, stock in, stock out, adjustments) | inventory_transactions |
| Application settings (first-run flag) | inventory_settings |

Available stock is never stored. It is calculated from transactions:
`Opening + Stock In - Stock Out + Net Adjustments`.

localStorage is not suitable for secure, shared, production inventory data. It is used here
only because this POC has no backend.

## Documentation
All documents are in the `docs/` folder:
- requirements-understanding.md
- navigation-flow.md
- components-and-storage.md
- test-cases.md
- assumptions.md
- known-issues.md
- screenshots/