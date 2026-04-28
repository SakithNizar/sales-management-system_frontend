export interface Expense {
  id: string;
  date: string;
  category: string;
  subject: string;
  invoiceNo: string;
  amount: number;
  paymentMethod: string;
  notes: string;
  createdBy: string;
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
  month: string;
  date: string;
  basic: number;
  advance: number;
  paid: number;
  totalPaid: number;
  balance: number;
  paymentNo: string;
  remarks: string;
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
  minLevel: number;
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
  photo?: string;
  contact: string;
  whatsapp: string;
  address: string;
  location: string;
  email: string;
  route: string;
  creditLimit: number;
  status: string;
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

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  expiryDate: string;
  status: string;
}

export interface Salesman {
  id: string;
  name: string;
  username: string;
  phone: string;
  status: string;
}