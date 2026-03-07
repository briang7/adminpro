import { defineEventHandler, readBody, getRouterParam, createError } from 'h3';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { products } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product ID' });
  }

  const body = await readBody<{
    name?: string;
    sku?: string;
    category?: string;
    price?: string;
    stock?: number;
    status?: string;
  }>(event);

  if (!body || Object.keys(body).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Request body is empty' });
  }

  const [updated] = await db
    .update(products)
    .set(body)
    .where(eq(products.id, id))
    .returning();

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' });
  }

  return updated;
});
