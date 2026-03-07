import { defineEventHandler, getRouterParam, createError } from 'h3';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { customers } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid customer ID' });
  }

  const [deleted] = await db
    .delete(customers)
    .where(eq(customers.id, id))
    .returning();

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Customer not found' });
  }

  return { success: true, deleted };
});
