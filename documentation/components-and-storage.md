# Components and Data Storage

## Architecture
Page > Service > Storage.
- Pages show data and collect input. They contain no localStorage code or business rules.
- Services validate, apply business rules and save. They return a result object.
- Storage helpers read and write localStorage safely.

## Layout (src/layout)
MainLayout, Header, Sidebar, navItems (menu items and page titles)

## Pages (src/pages)
Dashboard, ProductList, ProductForm (add and edit), ProductDetails, Categories, Suppliers,
StockIn, StockOut, StockAdjustment, Transactions, Reports, NotFound,
reportViews/CurrentStockReport, reportViews/StockMovementReport, reportViews/LowStockReport

## Reusable components (src/components)
CategoryDialog, SupplierDialog, ConfirmDialog, StatusChip, StockStatusChip, QuantityChange,
ProductPicker, ProductNotFound, KpiCard, StockByCategoryChart, ReportTable, NotificationProvider

## Hooks (src/hooks)
useNotification (snackbar messages from any screen), useSortedRows (sorting for report tables)

## Services (src/services)
storage, repository, initService, categoryService, supplierService, productService,
transactionService, historyService, dashboardService, reportService

## Utilities (src/utils)
constants, id, validators, transactionValidators, stock, table, format, dates, csv

## Other
data/seedData (sample data), theme.js (MUI theme)

## Data storage explanation
- Everything is JSON in localStorage under the inventory_* keys.
- initService loads sample data only when no settings flag and no data exist (first run).
- readStorage reports ok, missing, corrupted or error. Corrupted values are copied to
  <key>_corrupted_backup and screens show an alert; nothing is written over them.
- Product records have no stock field. buildStockMap sums quantityChange per product.
- Opening stock is saved as an Opening transaction when a product is created.
- Stock Out is saved as a negative quantity change; an adjustment is saved as actual minus current.
- Each transaction stores balanceAfter for the history screen.
- Services re-read stock from storage at save time, so a stale screen cannot break a rule.
- Creating a product saves the product, then its opening transaction; if the second save
  fails, the first is rolled back.
- No function edits or deletes a transaction (immutability).
- Records are deactivated, never deleted, so history stays intact.

## Data flow example (Stock Out)
Form (StockOut.jsx) > recordStockOut (transactionService) > loads fresh products and
transactions > validateStockOut > appendTransaction (balance must be 0 or more) >
saveItems (storage) > the form shows the new balance > Dashboard and reports recalculate
the next time they open.