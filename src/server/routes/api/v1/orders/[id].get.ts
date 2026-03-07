import { defineEventHandler, getRouterParam, createError } from 'h3';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { orders, customers } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' });
  }

  const [order] = await db
    .select({
      id: orders.id,
      customerId: orders.customerId,
      customerName: customers.company,
      amount: orders.amount,
      status: orders.status,
      itemsCount: orders.itemsCount,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.id, id));

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' });
  }

  return order;
});
