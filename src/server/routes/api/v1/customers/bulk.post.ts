import { defineEventHandler, readBody, createError } from 'h3';
import { inArray } from 'drizzle-orm';
import { db } from '../../../../db';
import { customers } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ ids: number[]; action: string }>(event);

  if (!body?.ids?.length || !body?.action) {
    throw createError({ statusCode: 400, statusMessage: 'ids and action required' });
  }

  switch (body.action) {
    case 'delete':
      await db.delete(customers).where(inArray(customers.id, body.ids));
      return { success: true, affected: body.ids.length };
    case 'activate':
      await db.update(customers).set({ status: 'active' }).where(inArray(customers.id, body.ids));
      return { success: true, affected: body.ids.length };
    case 'deactivate':
      await db.update(customers).set({ status: 'inactive' }).where(inArray(customers.id, body.ids));
      return { success: true, affected: body.ids.length };
    default:
      throw createError({ statusCode: 400, statusMessage: `Unknown action: ${body.action}` });
  }
});
