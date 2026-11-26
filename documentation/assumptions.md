# Assumptions and Clarifications

## Master data
- Codes allow letters, numbers, hyphen and underscore (max 20) and are compared case-insensitively.
- Category and supplier codes cannot be changed after creation, like product codes.
- Category name max 50 characters; supplier name max 100; supplier phone optional (7 to 15 characters).
- Categories, suppliers and products are never deleted, only deactivated.
- A product cannot be activated while its category is inactive.
- An inactive supplier cannot be chosen for new products or receipts; an existing product keeps its supplier.

## Products and stock
- An Opening transaction is recorded only when opening stock is greater than 0.
- Quantities are limited to 1,000,000; unit cost allows 2 decimal places; currency is INR.
- Transaction ids use the format TXN-0001 and increase by one from the highest existing number.
- Stock In unit cost is kept on the transaction only; it never changes the product master unit cost.
- An adjustment where actual stock equals system stock is rejected as meaningless.
- "Issued To" is an employee name; Department is free text.
- Transaction date and time are set automatically when saved.

## Dashboard
- KPIs, chart and alerts count only active products.
- Low Stock Products counts stock above 0 and at or below the reorder level; Out of Stock is counted separately.
- Today's Transactions counts Stock In, Stock Out and Adjustment records for the current local day; Opening records are not counted.
- The replenishment list shows Out of Stock first, then the largest shortfall, up to 8 rows.

## Reports and CSV
- Current Stock shows Active products by default, with a Product Status filter.
- The Low Stock report includes Out of Stock products and a Supplier column.
- The Stock Movement report includes the Transaction ID column.
- CSV files contain every row matching the filters (not only the visible page), in the current sort order.
- CSV dates use YYYY-MM-DD HH:mm in local time; money values are plain numbers.
- Text starting with = + - or @ is prefixed with ' in CSV files.
- Switching report tabs resets that report's filters.

## History
- Newest transactions are shown first by default.
- Date filters compare local calendar days, and both dates are inclusive.
- A From date later than the To date shows an error and no rows.
- An unknown product id in the history link is ignored with a warning.

## Sample data
- Sample transaction dates are relative to the first run (opening stock 35 days earlier; movements over the following 30 days, the last one on the first-run day).