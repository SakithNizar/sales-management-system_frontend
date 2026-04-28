import { create } from 'zustand';
import type { InventoryItem, StockIn, StockOut } from '../types';

interface InventoryState {
  items: InventoryItem[];
  stockIns: StockIn[];
  stockOuts: StockOut[];
  addItem: (item: InventoryItem) => void;
  updateItem: (id: string, item: InventoryItem) => void;
  deleteItem: (id: string) => void;
  addStockIn: (stockIn: StockIn) => void;
  addStockOut: (stockOut: StockOut) => void;
}

const useInventoryStore = create<InventoryState>((set) => ({
  items: [
    { id: '1', name: 'Vanilla Yogurt Drink', category: 'Finished Product', unit: 'Bottle', stock: 350, reorderLvl: 100, unitPrice: 150, shelfLife: 14, storageTemp: '2-8°C', status: 'Active' },
  ],
  stockIns: [
    { id: '1', date: '15-02-2026', invoiceNo: 'ST-IN-001', item: 'Vanilla Yogurt Drink', quantity: 500, unit: 'Bottles', manager: 'Nimal', remarks: 'Production Batch' },
  ],
  stockOuts: [
    { id: '1', date: '16-02-2026', invoiceNo: 'ST-OUT-001', item: 'Vanilla Yogurt Drink', quantity: 200, unit: 'Bottles', manager: 'Nimal', reason: 'Sales Dispatch' },
  ],
  addItem: (item) => set((state) => ({ items: [...state.items, { ...item, id: Date.now().toString() }] })),
  updateItem: (id, item) => set((state) => ({ items: state.items.map((i) => (i.id === id ? item : i)) })),
  deleteItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  addStockIn: (stockIn) => set((state) => ({ stockIns: [...state.stockIns, { ...stockIn, id: Date.now().toString() }] })),
  addStockOut: (stockOut) => set((state) => ({ stockOuts: [...state.stockOuts, { ...stockOut, id: Date.now().toString() }] })),
}));

export default useInventoryStore;