# Requirement Understanding

## 1. Purpose
An organisation tracks items such as laptops, keyboards, monitors and office supplies manually
or in Excel. The application replaces this with a simple tool to manage product information,
record incoming and outgoing stock, monitor available quantities and identify products that
need replenishment. It is a React front-end only; data is kept in localStorage.

## 2. Scope
In scope: Dashboard, Products, Categories, Suppliers, Stock In, Stock Out, Stock Adjustment,
Transaction History, Low Stock alerts, Reports, search/filter/sort/pagination, localStorage
persistence and CSV export.

Out of scope: backend API, database, real authentication, purchase orders, barcode scanning,
multi-warehouse, accounting/GST, email/SMS notifications, deployment.

## 3. Entities
| Entity | Fields |
|---|---|
| Category | code, name, description, status |
| Supplier | code, name, contact person, email, phone, status |
| Product | code, name, category, supplier, description, unit, unit cost, reorder level, status |
| Transaction | id, date, product, type (Opening / Stock In / Stock Out / Adjustment), quantity change, balance after, reference, remarks (plus supplier and unit cost for Stock In; issued to, department and purpose for Stock Out; reason for Adjustment) |

## 4. Core design idea
Stock is never typed in or edited directly. Every movement is saved as an immutable
transaction, and available stock is calculated by summing them. Opening stock is saved as an
"Opening" transaction when a product is created. Because all screens read the same
transactions, the Product List, Dashboard, History and Reports can never disagree.

## 5. Calculation rules
- Available Stock = Opening Stock + Stock In - Stock Out + Net Adjustments
- Inventory Value = Available Stock x current master Unit Cost
- Shortfall = max(0, Reorder Level - Available Stock)
- Stock Status: 0 = Out of Stock; above 0 and up to the reorder level = Low Stock; above = In Stock

Worked example: opening 20, Stock In +15, Stock Out -8, adjustment -2 gives 25 units.

## 6. Functional requirements: where each is implemented
| Requirement | Implementation |
|---|---|
| FR-001 Layout | layout/MainLayout, Header, Sidebar, navItems; React Router; active item highlighted |
| FR-002 Dashboard | pages/Dashboard, services/dashboardService, components/KpiCard, StockByCategoryChart |
| FR-003 Product list | pages/ProductList (search, category and status filters, sorting, pagination 5/10/20, Clear Filters) |
| FR-004 Add/Edit product | pages/ProductForm, utils/validators (validateProduct), services/productService |
| FR-005 Product details | pages/ProductDetails (latest 10 transactions, link to full history) |
| FR-006 Categories | pages/Categories, components/CategoryDialog, services/categoryService |
| FR-007 Suppliers | pages/Suppliers, components/SupplierDialog, services/supplierService |
| FR-008 Stock In | pages/StockIn, services/transactionService (recordStockIn) |
| FR-009 Stock Out | pages/StockOut, services/transactionService (recordStockOut) |
| FR-010 Stock Adjustment | pages/StockAdjustment, services/transactionService (recordAdjustment) |
| FR-011 Transaction history | pages/Transactions, services/historyService (read-only) |
| FR-012 Low stock alerts | utils/stock (getStockStatus), Dashboard list, Low Stock report |
| FR-013 Reports | pages/Reports and pages/reportViews/*, utils/csv |
| FR-014 Validation and errors | validators, MUI Alert, Snackbar (NotificationProvider), ConfirmDialog |
| FR-015 Data persistence | services/storage, repository, initService |

## 7. Business rules: how each is enforced
| Rule | Enforcement |
|---|---|
| BR-001 Unique product code | validateProduct, case-insensitive comparison |
| BR-002 Name and category mandatory | validateProduct |
| BR-003 Non-negative integer quantities | whole-number checks in validators and transactionValidators |
| BR-004 Stock In increases stock | recordStockIn saves a positive quantity change |
| BR-005 Stock Out decreases stock | recordStockOut saves a negative quantity change |
| BR-006 Stock Out cannot exceed stock | validateStockOut using stock re-read from storage at save time |
| BR-007 Adjustment needs a reason | validateAdjustment |
| BR-008 Balance never negative | appendTransaction refuses a negative balanceAfter |
| BR-009 All movements recorded | every change, including opening stock, is an appended transaction |
| BR-010 Transactions immutable | no update or delete function exists; history screen is read-only |
| BR-011 Inactive products not used | dropdowns list active products only; service checks again |
| BR-012 Low stock follows reorder level | getStockStatus |
| BR-013 Inventory value | getInventoryValue (available x master unit cost) |
| BR-014 Dashboard and reports current | calculated from storage each time a page opens |
| BR-015 Persistence | localStorage, verified by refresh tests |
| BR-016 Sample data once | initService checks the settings flag and existing data |
| BR-017 Code and opening stock locked | form fields disabled; updateProduct ignores them |
| BR-018 Deactivation keeps history | status flag only; nothing is deleted |
| BR-019 Invalid forms change nothing | services validate before saving; product creation rolls back on failure |
| BR-020 CSV matches filters | table and CSV export use the same filtered, sorted list |

## 8. Non-functional requirements
- Usability: consistent MUI theme; responsive for desktop and tablet (sidebar becomes a drawer)
- Code quality: functional components and hooks; page > service > storage layering
- Reliability: validation before saving; the form clears or navigates after a successful save to avoid duplicates; corrupted storage is backed up and never overwritten
- Performance: derived values use a single pass over transactions; tested with 100 products and 530 transactions
- Security awareness: no credentials stored; React escapes user text (no dangerouslySetInnerHTML); CSV text beginning with = + - @ is prefixed to prevent formula injection; localStorage is not secure or shared storage