import { defineEventHandler, readBody, getRouterParam, createError } from 'h3';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { orders } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid order ID' });
  }

  const body = await readBody<{
    customerId?: number;
    amount?: string;
    status?: string;
    itemsCount?: number;
  }>(event);

  if (!body || Object.keys(body).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Request body is empty' });
  }

  const [updated] = await db
    .update(orders)
    .set(body)
    .where(eq(orders.id, id))
    .returning();

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' });
  }

  return updated;
});
