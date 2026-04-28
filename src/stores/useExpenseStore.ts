import { create } from 'zustand';
import type { Expense } from '../types';

interface ExpenseState {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Expense) => void;
  deleteExpense: (id: string) => void;
}

const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [
    {
      id: '1',
      date: '12-02-2026',
      category: 'Raw Material',
      subject: 'Milk Powder Purchase',
      invoiceNo: 'INV001',
      amount: 25000,
      paymentMethod: 'Cash',
      notes: '',
      createdBy: 'Admin',
      createdAt: '12-02-2026',
    },
  ],
  addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, { ...expense, id: Date.now().toString() }] })),
  updateExpense: (id, expense) => set((state) => ({ expenses: state.expenses.map((e) => (e.id === id ? expense : e)) })),
  deleteExpense: (id) => set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),
}));

export default useExpenseStore;