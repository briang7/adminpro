import { defineEventHandler } from 'h3';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { dashboardConfigs } from '../../../../db/schema';
import { getAuthFromEvent } from '../../../../utils/auth';

export default defineEventHandler(async (event) => {
  const auth = getAuthFromEvent(event);
  if (!auth) return [];
  return db.select().from(dashboardConfigs).where(eq(dashboardConfigs.userId, auth.userId));
});
