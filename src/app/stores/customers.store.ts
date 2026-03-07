import { createEntityStore } from './entity.store';

export interface Customer {
  id: number;
  company: string;
  contactName: string;
  email: string;
  phone: string | null;
  status: string;
  tier: string;
  revenue: string;
  createdAt: string;
}

export const CustomersStore = createEntityStore<Customer>('customers', 'customers');
