export interface Expense {
  id: string;
  date: string;           // "02/10/2026"
  category: string;
  subject: string;
  invoiceNo: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank' | 'Credit';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Raw Material' | 'Finished Good';
  unit: string;
  shelfLife: number; // in days
  minimumLevel: number;
  status: 'Active' | 'Inactive';
  createdDate: string; // "2026-03-26" format
}

export interface Batch {
  id: string;
  batchNo: string;
  product: string;
  quantity: number;
  totalCost: number;
  prodDate: string;
  expiryDate: string;
  status: 'Completed' | 'In Progress' | 'Pending';
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  base: number;
  advance: number;
  bonus?: number;
  deduct?: number;
  paid: number;
  balance: number;
  status: 'Paid' | 'Partial' | 'Pending';
}

export interface ProductionBatch {
  id: string;
  date: string;
  invoiceNo: string;
  product: string;
  batchNo: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  expiryDate: string;
  status: string;
  notes: string;
}

export interface Salary {
  id: string;
  staffName: string;
  role: string;
  month: string;
  date: string;
  basic: number;
  advance: number;
  bonus: number;
  deduct: number;
  paid: number;
  totalPaid: number;
  balance: number;
  paymentNo: string;
  remarks: string;
  status: 'Paid' | 'Partial' | 'Pending';
}

export interface Advance {
  id: string;
  staffName: string;
  date: string;
  amount: number;
  paymentNo: string;
  notes: string;
}

export interface AccountEntry {
  id: string;
  date: string;
  invoiceNo: string;
  description: string;
  income: number;
  expense: number;
  total: number;
  balance: number;
  createdBy: string;
  paymentMethod: string;
  accountType: string;
  notes: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  reorderLvl: number;
  unitPrice: number;
  shelfLife: number;
  storageTemp: string;
  status: string;
}

export interface StockIn {
  id: string;
  date: string;
  invoiceNo: string;
  item: string;
  quantity: number;
  unit: string;
  manager: string;
  remarks: string;
}

export interface StockOut {
  id: string;
  date: string;
  invoiceNo: string;
  item: string;
  quantity: number;
  unit: string;
  manager: string;
  reason: string;
}

export interface Customer {
  id: string;
  name: string;
  shopName: string;
  photo: string;
  contact: string;
  whatsapp: string;
  address: string;
  location: string;
  email: string;
  route: string;
  creditLimit: number;
  outstanding: number;
  status: string;
  joined: string;
  notes: string;
  enteredBy: string;
  dateAdded: string;
}

export interface Sale {
  id: string;
  date: string;
  invoiceNo: string;
  salesman: string;
  customer: string;
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
  paymentType: string;
  paid: number;
  balance: number;
}

export interface Salesman {
  id: string;
  name: string;
  username: string;
  phone?: string;
  status: string;
}