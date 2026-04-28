import { create } from 'zustand';
import type { Customer } from '../types';

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Customer) => void;
  deleteCustomer: (id: string) => void;
}

const useCustomerStore = create<CustomerState>((set) => ({
  customers: [
    {
      id: 'CUS-001',
      name: 'Mohamed Rizwan',
      shopName: 'Rizwan Stores',
      photo: '',
      contact: '0712345678',
      whatsapp: '0712345678',
      address: '123 Main St, Colombo',
      location: '6.9271,79.8612',
      email: 'rizwan@example.com',
      route: 'Central Route',
      creditLimit: 50000,
      outstanding: 12500,
      status: 'Active',
      joined: '2025-06-15',
      notes: '',
      enteredBy: 'Admin',
      dateAdded: '15-02-2026',
    },
  ],
  addCustomer: (customer) => set((state) => ({ customers: [...state.customers, { ...customer, id: `CUS-${state.customers.length + 1}`.padStart(3, '0') }] })),
  updateCustomer: (id, customer) => set((state) => ({ customers: state.customers.map((c) => (c.id === id ? customer : c)) })),
  deleteCustomer: (id) => set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),
}));

export default useCustomerStore;