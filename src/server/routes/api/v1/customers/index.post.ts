import { defineEventHandler, readBody, createError } from 'h3';
import { db } from '../../../../db';
import { customers } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    company: string;
    contactName: string;
    email: string;
    phone?: string;
    status?: string;
    tier?: string;
    revenue?: string;
  }>(event);

  if (!body?.company || !body?.contactName || !body?.email) {
    throw createError({ statusCode: 400, statusMessage: 'company, contactName, and email are required' });
  }

  const [created] = await db
    .insert(customers)
    .values({
      company: body.company,
      contactName: body.contactName,
      email: body.email,
      phone: body.phone,
      status: body.status || 'active',
      tier: body.tier || 'standard',
      revenue: body.revenue || '0',
    })
    .returning();

  return created;
});
