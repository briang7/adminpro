import { defineEventHandler, getRouterParam, createError } from 'h3';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { customers } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid customer ID' });
  }

  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id),
  });

  if (!customer) {
    throw createError({ statusCode: 404, statusMessage: 'Customer not found' });
  }

  return customer;
});
