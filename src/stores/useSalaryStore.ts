import { create } from 'zustand';
import type { Salary, Advance } from '../types';

interface SalaryState {
  salaries: Salary[];
  advances: Advance[];
  addSalary: (salary: Salary) => void;
  updateSalary: (id: string, salary: Salary) => void;
  deleteSalary: (id: string) => void;
  addAdvance: (advance: Advance) => void;
  updateAdvance: (id: string, advance: Advance) => void;
  deleteAdvance: (id: string) => void;
}

const useSalaryStore = create<SalaryState>((set) => ({
  salaries: [
    {
      id: '1',
      staffName: 'Mohamed Ali',
      role: 'Driver',
      month: 'Jan 2026',
      date: '31-01-2026',
      basic: 45000,
      advance: 10000,
      bonus: 0,
      deduct: 0,
      paid: 30000,
      totalPaid: 40000,
      balance: 5000,
      paymentNo: 'PAY-001',
      remarks: 'Pending balance',
      status: 'Partial',
    },
  ],
  advances: [
    {
      id: '1',
      staffName: 'Mohamed Ali',
      date: '10-01-2026',
      amount: 10000,
      paymentNo: 'ADV-001',
      notes: 'Emergency',
    },
  ],
  addSalary: (salary) => set((state) => ({ salaries: [...state.salaries, { ...salary, id: Date.now().toString(), totalPaid: salary.advance + salary.paid, balance: salary.basic - (salary.advance + salary.paid) }] })),
  updateSalary: (id, salary) => set((state) => ({ salaries: state.salaries.map((s) => (s.id === id ? { ...salary, totalPaid: salary.advance + salary.paid, balance: salary.basic - (salary.advance + salary.paid) } : s)) })),
  deleteSalary: (id) => set((state) => ({ salaries: state.salaries.filter((s) => s.id !== id) })),
  addAdvance: (advance) => set((state) => ({ advances: [...state.advances, { ...advance, id: Date.now().toString() }] })),
  updateAdvance: (id, advance) => set((state) => ({ advances: state.advances.map((a) => (a.id === id ? advance : a)) })),
  deleteAdvance: (id) => set((state) => ({ advances: state.advances.filter((a) => a.id !== id) })),
}));

export default useSalaryStore;