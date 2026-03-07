import { defineEventHandler, readBody, createError } from 'h3';
import { db } from '../../../../db';
import { dashboardConfigs } from '../../../../db/schema';
import { getAuthFromEvent } from '../../../../utils/auth';

export default defineEventHandler(async (event) => {
  const auth = getAuthFromEvent(event);
  if (!auth) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });

  const body = await readBody(event);
  const [config] = await db.insert(dashboardConfigs).values({
    userId: auth.userId,
    name: body.name,
    layoutJson: body.layoutJson,
    isDefault: body.isDefault || false,
  }).returning();

  return config;
});
