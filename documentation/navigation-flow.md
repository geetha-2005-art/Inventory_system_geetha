# Screen Navigation Flow

## Diagram (Mermaid)
Paste this into https://mermaid.live to view it and export a PNG for the submission.

```mermaid
flowchart TD
  L["Main Layout: Sidebar + Header"]
  L --> D["Dashboard /"]
  L --> PL["Product List /products"]
  L --> C["Categories /categories"]
  L --> S["Suppliers /suppliers"]
  L --> SI["Stock In /stock-in"]
  L --> SO["Stock Out /stock-out"]
  L --> SA["Stock Adjustment /stock-adjustment"]
  L --> T["Transaction History /transactions"]
  L --> R["Reports /reports"]

  PL --> PA["Add Product /products/new"]
  PL --> PD["Product Details /products/:id"]
  PL --> PE["Edit Product /products/:id/edit"]
  PD --> PE
  PD --> T
  D --> PD
  D --> LSR["Low Stock Report"]
  R --> CSR["Current Stock Report"]
  R --> SMR["Stock Movement Report"]
  R --> LSR
  T --> PD
```

## Text version
```
Main Layout (Sidebar + Header)
  Dashboard ............ product details, Low Stock report
  Products ............. Add Product, Product Details, Edit Product
        Product Details ... Edit Product, Transaction History (filtered by product)
  Categories ........... Add/Edit dialog
  Suppliers ............ Add/Edit dialog
  Stock In
  Stock Out
  Stock Adjustment
  Transactions ......... product details (click a product code)
  Reports .............. Current Stock | Stock Movement | Low Stock (tabs)
Unknown address ........ Page Not Found (back to Dashboard)
Unknown product id ..... Product Not Found (back to Products)
```