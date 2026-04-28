import { create } from 'zustand';
import type { AccountEntry } from '../types';

interface AccountState {
  entries: AccountEntry[];
  addEntry: (entry: AccountEntry) => void;
  updateEntry: (id: string, entry: AccountEntry) => void;
  deleteEntry: (id: string) => void;
}

const useAccountStore = create<AccountState>((set) => ({
  entries: [
    {
      id: '1',
      date: '01-02-2026',
      invoiceNo: 'INV-001',
      description: 'Product Sales',
      income: 50000,
      expense: 0,
      total: 50000,
      balance: 50000,
      createdBy: 'Admin',
      paymentMethod: 'Cash',
      accountType: 'Cash',
      notes: '',
    },
  ],
  addEntry: (entry) => set((state) => {
    const lastBalance = state.entries.length > 0 ? state.entries[state.entries.length - 1].balance : 0;
    const newBalance = lastBalance + entry.income - entry.expense;
    return { entries: [...state.entries, { ...entry, id: Date.now().toString(), total: entry.income - entry.expense, balance: newBalance }] };
  }),
  updateEntry: (id, entry) => set((state) => ({ entries: state.entries.map((e) => (e.id === id ? entry : e)) })),
  deleteEntry: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
}));

export default useAccountStore;