import { createEntityStore } from './entity.store';

export interface Order {
  id: number;
  customerId: number;
  amount: string;
  status: string;
  itemsCount: number;
  createdAt: string;
}

export const OrdersStore = createEntityStore<Order>('orders', 'orders');
