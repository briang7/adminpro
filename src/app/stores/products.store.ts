import { createEntityStore } from './entity.store';

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: number;
  status: string;
}

export const ProductsStore = createEntityStore<Product>('products', 'products');
