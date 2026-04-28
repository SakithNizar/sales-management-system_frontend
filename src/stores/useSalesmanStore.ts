import { create } from 'zustand';
import type { Salesman } from '../types';

interface SalesmanState {
  salesmen: Salesman[];
  addSalesman: (salesman: Salesman) => void;
  updateSalesman: (id: string, salesman: Salesman) => void;
  deleteSalesman: (id: string) => void;
}

const useSalesmanStore = create<SalesmanState>((set) => ({
  salesmen: [
    {
      id: '1',
      name: 'Nimal Perera',
      username: 'nimal',
      phone: '0771234567',
      status: 'active',
    },
    {
      id: '2',
      name: 'Kamal Silva',
      username: 'kamal',
      phone: '0779876543',
      status: 'active',
    },
  ],
  addSalesman: (salesman) => set((state) => ({ salesmen: [...state.salesmen, { ...salesman, id: Date.now().toString() }] })),
  updateSalesman: (id, salesman) => set((state) => ({ salesmen: state.salesmen.map((s) => (s.id === id ? salesman : s)) })),
  deleteSalesman: (id) => set((state) => ({ salesmen: state.salesmen.filter((s) => s.id !== id) })),
}));

export default useSalesmanStore;
