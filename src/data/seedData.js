import { TRANSACTION_TYPES, STATUS } from '../utils/constants';

const CATEGORIES = [
  ['CAT-001', 'Laptops', 'Laptops and notebooks'],
  ['CAT-002', 'Peripherals', 'Keyboards, mice and storage'],
  ['CAT-003', 'Monitors & Printers', 'Displays and printers'],
  ['CAT-004', 'Network Accessories', 'Switches, routers and cables'],
  ['CAT-005', 'Office Supplies', 'Paper, pens and stationery'],
];

const SUPPLIERS = [
  ['SUP-001', 'Dell India Pvt Ltd', 'Arun Mehta', 'arun@dellindia.example.com', '9876500001'],
  ['SUP-002', 'HP Distributors', 'Neha Sharma', 'neha@hpdist.example.com', '9876500002'],
  ['SUP-003', 'Tech Hub Traders', 'Rahul Verma', 'rahul@techhub.example.com', '9876500003'],
  ['SUP-004', 'Logitech Partners', 'Sanjay Gupta', 'sanjay@logipartners.example.com', '9876500004'],
  ['SUP-005', 'Office Mart', 'Divya Reddy', 'divya@officemart.example.com', '9876500005'],
];

// [code, name, categoryNo, supplierNo, unit, unitCost, reorderLevel, openingStock]
const PRODUCT_ROWS = [
  ['LAP-001', 'Dell Latitude 5420 Laptop', 1, 1, 'Pieces', 65000, 5, 12],
  ['LAP-002', 'HP ProBook 450 G9 Laptop', 1, 2, 'Pieces', 58000, 5, 10],
  ['LAP-003', 'Lenovo ThinkPad E14 Laptop', 1, 3, 'Pieces', 62000, 4, 8],
  ['KEY-001', 'Logitech K120 Keyboard', 2, 4, 'Pieces', 650, 15, 40],
  ['KEY-002', 'Dell KB216 Wired Keyboard', 2, 1, 'Pieces', 700, 15, 35],
  ['MOU-001', 'Logitech B100 Mouse', 2, 4, 'Pieces', 350, 20, 50],
  ['MOU-002', 'HP X1000 Wireless Mouse', 2, 2, 'Pieces', 550, 10, 25],
  ['MON-001', 'Dell 24 inch Monitor', 3, 1, 'Pieces', 9500, 5, 15],
  ['MON-002', 'LG 22 inch Monitor', 3, 5, 'Pieces', 7800, 5, 12],
  ['MON-003', 'Samsung 27 inch Monitor', 3, 3, 'Pieces', 14500, 3, 6],
  ['PRN-001', 'HP LaserJet Pro M126 Printer', 3, 2, 'Pieces', 18500, 3, 7],
  ['PRN-002', 'Canon Pixma Inkjet Printer', 3, 5, 'Pieces', 6500, 3, 5],
  ['NET-001', 'TP-Link 8-Port Switch', 4, 3, 'Pieces', 1200, 8, 20],
  ['NET-002', 'Cat6 Ethernet Cable 3m', 4, 4, 'Pieces', 150, 50, 200],
  ['NET-003', 'D-Link Wi-Fi Router', 4, 3, 'Pieces', 2400, 5, 14],
  ['OFF-001', 'A4 Paper Ream', 5, 5, 'Packs', 280, 40, 120],
  ['OFF-002', 'Ball Pen Box (50 pcs)', 5, 5, 'Boxes', 220, 10, 30],
  ['OFF-003', 'Stapler Heavy Duty', 5, 5, 'Pieces', 180, 10, 18],
  ['OFF-004', 'Whiteboard Marker Set', 5, 5, 'Sets', 320, 10, 25],
  ['USB-001', 'USB Flash Drive 64GB', 2, 4, 'Pieces', 450, 15, 60],
];

// [productNo, kind, quantity, note]  (ADJ quantity is signed)
const MOVEMENTS = [
  [1, 'IN', 5, 'Quarterly laptop purchase'],
  [1, 'OUT', 3, 'New joiners'],
  [2, 'OUT', 4, 'Sales team laptops'],
  [2, 'OUT', 2, 'Replacement of faulty laptops'],
  [3, 'OUT', 5, 'Development team upgrade'],
  [4, 'OUT', 10, 'Training room setup'],
  [4, 'IN', 20, 'Restocking keyboards'],
  [5, 'OUT', 25, 'New office floor setup'],
  [6, 'OUT', 20, 'New office floor setup'],
  [6, 'OUT', 12, 'Replacement of faulty mice'],
  [7, 'IN', 10, 'Wireless mouse purchase'],
  [7, 'ADJ', -2, 'Physical count mismatch'],
  [8, 'OUT', 6, 'Design team monitors'],
  [8, 'OUT', 5, 'Conference room displays'],
  [9, 'IN', 8, 'Monitor restock'],
  [9, 'OUT', 3, 'Reception desk setup'],
  [10, 'OUT', 4, 'Video editing team'],
  [10, 'OUT', 2, 'Management cabin'],
  [11, 'OUT', 3, 'Department printers'],
  [12, 'ADJ', -1, 'Damaged unit written off'],
  [13, 'OUT', 8, 'Server room expansion'],
  [13, 'IN', 10, 'Switch restock'],
  [14, 'OUT', 160, 'Network cabling project'],
  [15, 'OUT', 4, 'Branch office setup'],
  [16, 'OUT', 90, 'Monthly paper issue'],
  [17, 'IN', 20, 'Stationery restock'],
  [18, 'OUT', 6, 'Admin department'],
  [19, 'OUT', 8, 'Meeting rooms'],
  [20, 'OUT', 15, 'Client events'],
  [20, 'ADJ', 3, 'Found extra units during audit'],
];

const ISSUE_TARGETS = [
  ['Ravi Kumar', 'IT'],
  ['Anita Rao', 'HR'],
  ['Suresh Babu', 'Finance'],
  ['Priya Nair', 'Operations'],
];

export function buildSeedData() {
  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const categories = CATEGORIES.map(([code, name, description], i) => ({
    id: `cat_${i + 1}`,
    code,
    name,
    description,
    status: STATUS.ACTIVE,
  }));

  const suppliers = SUPPLIERS.map(([code, name, contactPerson, email, phone], i) => ({
    id: `sup_${i + 1}`,
    code,
    name,
    contactPerson,
    email,
    phone,
    status: STATUS.ACTIVE,
  }));

  const products = [];
  const transactions = [];
  const balances = {}; // running balance per product while building

  let counter = 1;
  const nextId = () => `TXN-${String(counter++).padStart(4, '0')}`;

  // 1) Products + their Opening transactions
  PRODUCT_ROWS.forEach((row, i) => {
    const [code, name, catNo, supNo, unit, unitCost, reorderLevel, opening] = row;
    const id = `prod_${i + 1}`;

    products.push({
      id,
      code,
      name,
      categoryId: `cat_${catNo}`,
      supplierId: `sup_${supNo}`,
      description: '',
      unit,
      unitCost,
      reorderLevel,
      status: STATUS.ACTIVE,
    });

    balances[id] = opening;
    transactions.push({
      id: nextId(),
      date: new Date(now - 35 * DAY).toISOString(),
      productId: id,
      type: TRANSACTION_TYPES.OPENING,
      quantityChange: opening,
      balanceAfter: opening,
      reference: '',
      remarks: 'Opening stock',
    });
  });

  // 2) Stock In / Out / Adjustment transactions
  MOVEMENTS.forEach(([productNo, kind, qty, note], i) => {
    const product = products[productNo - 1];
    const change = kind === 'OUT' ? -qty : qty;
    balances[product.id] += change;

    const base = {
      id: nextId(),
      date: new Date(now - (29 - i) * DAY).toISOString(),
      productId: product.id,
      quantityChange: change,
      balanceAfter: balances[product.id],
      remarks: note,
    };

    if (kind === 'IN') {
      transactions.push({
        ...base,
        type: TRANSACTION_TYPES.STOCK_IN,
        supplierId: product.supplierId,
        unitCost: product.unitCost,
        reference: `PO-${1000 + i}`,
      });
    } else if (kind === 'OUT') {
      const [issuedTo, department] = ISSUE_TARGETS[i % ISSUE_TARGETS.length];
      transactions.push({
        ...base,
        type: TRANSACTION_TYPES.STOCK_OUT,
        issuedTo,
        department,
        purpose: note,
        reference: '',
      });
    } else {
      transactions.push({
        ...base,
        type: TRANSACTION_TYPES.ADJUSTMENT,
        reference: '',
      });
    }
  });

  return { categories, suppliers, products, transactions };
}