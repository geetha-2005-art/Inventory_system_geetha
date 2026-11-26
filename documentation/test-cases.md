# Test Cases

Environment: Google Chrome, Windows, http://localhost:5173 (npm run dev)
Tester: ____________________    Date: 25 November 2026
Data: localStorage cleared before the run, so the sample data is loaded fresh. Tests were run
in order; later tests use data from earlier ones.
Result values: Pass or Fail. TBD means not run yet; replace it before submitting.

## Acceptance tests
| ID | Scenario | Steps | Expected result | Result |
|---|---|---|---|---|
| AC-01 | Open application for the first time | Clear localStorage, refresh, open Dashboard, Products, Categories, Suppliers, Transactions | Dashboard shows 20 products; lists show 20 products, 5 categories, 5 suppliers; Transactions shows 50 of 50 | Pass |
| AC-02 | Add a valid product | Add TST-001, Test Webcam, Peripherals, Logitech Partners, Pieces, cost 1500, opening 10, reorder 10 | Product appears in the list with stock 10 and Low Stock | Pass |
| AC-03 | Add duplicate product code | Add a product with code LAP-001, then lap-001 | "This product code already exists"; nothing saved | Pass |
| AC-04 | Submit product without required fields | Open Add Product and click Save with all fields empty | Errors on all required fields; nothing saved | Pass |
| AC-05 | Edit product information | Edit TST-001: name Test Webcam HD, reorder level 5 | Record updated; status In Stock; Code and Opening Stock are disabled | Pass |
| AC-06 | Create a category | Add CAT-006 Cables; open Add Product | Cables appears in the Category dropdown | Pass |
| AC-07 | Create a supplier | Add SUP-006 Cable Corp; open Stock In and Add Product | Cable Corp appears in both Supplier dropdowns | Pass |
| AC-08 | Receive 10 units | Stock In: LAP-002, quantity 10 | Stock goes from 4 to 14 | Pass |
| AC-09 | Issue 5 units | Stock Out: LAP-001, quantity 5, Ravi Kumar, IT, Setup | Stock goes from 14 to 9 | Pass |
| AC-10 | Issue more than available | Stock Out: LAP-001, quantity 100 | Blocked: only 9 available; stock unchanged | Pass |
| AC-11 | Zero or negative issue quantity | Stock Out: quantity 0, then -3, then 2.5 | Validation message each time; nothing saved | Pass |
| AC-12 | Adjust stock to physical quantity | Adjustment: LAP-001, actual 7, reason Count correction | Difference -2 shown and recorded; stock 7 | Pass |
| AC-13 | Stock reaches zero | Stock Out: LAP-003, quantity 3 | Stock 0; Out of Stock displayed | Pass |
| AC-14 | Stock falls below reorder level | Stock Out: LAP-001, quantity 3 | Stock 4; Low Stock displayed | Pass |
| AC-15 | Update stock; dashboard recalculates | Open Dashboard after AC-08 to AC-14 | 21 products, 397 units, 6 low stock, 2 out of stock, value 15,26,550.00 | Pass |
| AC-16 | View transaction history | Open Transactions; filter product LAP-001; sort Date ascending | 56 of 56 transactions, newest first (TXN-0056 at the top); LAP-001 shows 6 rows with balances 12, 17, 14, 9, 7, 4 | Pass |
| AC-17 | Apply product filters | Products: Category Laptops with Low Stock, Out of Stock, In Stock; search lap; Clear Filters | Only LAP-001; only LAP-003; only LAP-002; 3 laptops; 21 products after clearing | Pass |
| AC-18 | Change pagination size | Products and Transactions: page size 5, 10, 20 | Correct row counts: 1-5 of 21, 1-10 of 21, 1-20 of 21 (Products); same sizes of 56 (Transactions) | Pass |
| AC-19 | Export stock report | Reports > Current Stock > Export CSV | File downloads with 21 data rows; LAP-001 row shows 4, 65000, 260000, Low Stock | Pass |
| AC-20 | Refresh application | Refresh Dashboard, Products, Transactions, Reports | All records and numbers are unchanged | Pass |
| AC-21 | Deactivate product | Deactivate MOU-001; check Stock In, Stock Out, Adjustment dropdowns and Transactions | Not offered in any dropdown; its 3 history rows remain; Dashboard shows 20 products | Pass|
| AC-22 | Open nonexistent product | Open /products/abc and /products/abc/edit | Friendly "Product not found" message with a back button | Pass |
| AC-23 | Change a historical transaction | Look for edit or delete controls in Transactions | None exist; notice states transactions are permanent | Pass |
| AC-24 | Deactivate category in use | Categories: deactivate Laptops (and set it Inactive via Edit) | Blocked: 3 active products use this category | Pass |
| AC-25 | Apply report filters and export | Reports > Stock Movement: LAP-001 and Stock Out; Export CSV | File has 3 data rows (-3, -5, -3; balances 4, 9, 14), matching the screen | Pass|

## Additional tests
| ID | Scenario | Steps | Expected result | Result |
|---|---|---|---|---|
| ET-01 | Corrupted products data | localStorage.setItem('inventory_products','abc'); refresh | Red alert on Products; Add Product disabled; backup key created; no crash | Pass |
| ET-02 | Corrupted transactions data | Same with inventory_transactions | Alerts on Dashboard, Transactions and stock forms; no crash | Pass |
| ET-03 | Corrupted categories data | localStorage.setItem('inventory_categories','{"a":1}'); refresh | Categories shows an alert; Add Category disabled | Pass|
| ET-04 | Performance | Load 100 products and 530 transactions with the test script | All screens open, filter and save without noticeable delay | Pass |
| ET-05 | Responsive layout | Narrow the window to tablet width | Sidebar becomes a menu drawer; tables scroll sideways | Pass |
| ET-06 | Duplicate submission | Double-click Save on Stock Out | Only one transaction is recorded | Pass |
| ET-07 | CSV formula safety | Add a product named =1+1 and export Current Stock | Name is written as '=1+1 in the file | Pass |
| ET-08 | Sample data only once | Refresh repeatedly after adding data | Added records are never overwritten or duplicated | Pass |