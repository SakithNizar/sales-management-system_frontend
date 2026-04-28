import { create } from 'zustand';
import type { Sale } from '../types';

interface SalesState {
  sales: Sale[];
  addSale: (sale: Sale) => void;
  updateSale: (id: string, sale: Sale) => void;
  deleteSale: (id: string) => void;
}

const useSalesStore = create<SalesState>((set) => ({
  sales: [
    {
      id: '1',
      date: '15-02-2026',
      invoiceNo: 'INV-001',
      salesman: 'Nimal',
      customer: 'Rizwan Stores',
      product: 'Vanilla Yogurt Drink',
      quantity: 50,
      unitPrice: 120,
      total: 6000,
      paymentType: 'Cash',
      paid: 6000,
      balance: 0,
    },
  ],
  addSale: (sale) => set((state) => ({ sales: [...state.sales, { ...sale, id: Date.now().toString(), total: sale.quantity * sale.unitPrice, balance: sale.quantity * sale.unitPrice - sale.paid }] })),
  updateSale: (id, sale) => set((state) => ({ sales: state.sales.map((s) => (s.id === id ? { ...sale, total: sale.quantity * sale.unitPrice, balance: sale.quantity * sale.unitPrice - sale.paid } : s)) })),
  deleteSale: (id) => set((state) => ({ sales: state.sales.filter((s) => s.id !== id) })),
}));

export default useSalesStore;