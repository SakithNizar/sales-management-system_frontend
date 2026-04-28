import { create } from 'zustand';
import type { Product } from '../types';

interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
}

const useProductStore = create<ProductState>((set) => ({
  products: [
    {
      id: '1',
      name: 'Sugar',
      category: 'Raw Material',
      unit: 'Kg',
      shelfLife: 0,
      minimumLevel: 100,
      status: 'Active',
      createdDate: '2026-03-27',
    },
    {
      id: '2',
      name: 'Milk Powder',
      category: 'Raw Material',
      unit: 'Kg',
      shelfLife: 0,
      minimumLevel: 10,
      status: 'Active',
      createdDate: '2026-03-26',
    },
    {
      id: '3',
      name: 'Vanilla Yogurt Drink',
      category: 'Finished Good',
      unit: 'Bottle',
      shelfLife: 7,
      minimumLevel: 100,
      status: 'Active',
      createdDate: '2026-03-26',
    },
    {
      id: '4',
      name: 'Yogurt Drink',
      category: 'Finished Good',
      unit: 'Bottle',
      shelfLife: 7,
      minimumLevel: 100,
      status: 'Active',
      createdDate: '2026-03-26',
    },
    {
      id: '5',
      name: 'Chocolate Yogurt Drink',
      category: 'Finished Good',
      unit: 'Bottle',
      shelfLife: 7,
      minimumLevel: 100,
      status: 'Active',
      createdDate: '2026-03-26',
    },
  ],
  addProduct: (product) => set((state) => ({ products: [...state.products, { ...product, id: Date.now().toString() }] })),
  updateProduct: (id, product) => set((state) => ({ products: state.products.map((p) => (p.id === id ? product : p)) })),
  deleteProduct: (id) => set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
}));

export default useProductStore;
