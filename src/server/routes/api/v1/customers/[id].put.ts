import { defineEventHandler, readBody, getRouterParam, createError } from 'h3';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { customers } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid customer ID' });
  }

  const body = await readBody<{
    company?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    status?: string;
    tier?: string;
    revenue?: string;
  }>(event);

  if (!body || Object.keys(body).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Request body is empty' });
  }

  const [updated] = await db
    .update(customers)
    .set(body)
    .where(eq(customers.id, id))
    .returning();

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Customer not found' });
  }

  return updated;
});
