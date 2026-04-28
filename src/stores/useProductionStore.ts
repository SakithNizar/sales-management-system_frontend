import { create } from 'zustand';
import type { ProductionBatch } from '../types';

interface ProductionState {
  batches: ProductionBatch[];
  addBatch: (batch: ProductionBatch) => void;
  updateBatch: (id: string, batch: ProductionBatch) => void;
  deleteBatch: (id: string) => void;
}

const useProductionStore = create<ProductionState>((set) => ({
  batches: [
    {
      id: '1',
      date: '15-02-2026',
      invoiceNo: 'PR-001',
      product: 'Vanilla Yogurt Drink',
      batchNo: 'BY-1001',
      quantity: 500,
      unitCost: 120,
      totalCost: 60000,
      expiryDate: '25-02-2026',
      status: 'Produced',
      notes: '',
    },
  ],
  addBatch: (batch) => set((state) => ({ batches: [...state.batches, { ...batch, id: Date.now().toString(), batchNo: `BY-${state.batches.length + 1001}`, totalCost: batch.quantity * batch.unitCost }] })),
  updateBatch: (id, batch) => set((state) => ({ batches: state.batches.map((b) => (b.id === id ? { ...batch, totalCost: batch.quantity * batch.unitCost } : b)) })),
  deleteBatch: (id) => set((state) => ({ batches: state.batches.filter((b) => b.id !== id) })),
}));

export default useProductionStore;