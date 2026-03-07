import { defineEventHandler, getQuery } from 'h3';
import { db } from '../../../db';
import { auditLog, users } from '../../../db/schema';
import { sql, desc, eq, and, gte, lte, SQL } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query['page']) || 1;
  const pageSize = Math.min(Number(query['pageSize']) || 50, 200);
  const conditions: SQL[] = [];

  if (query['userId']) {
    conditions.push(eq(auditLog.userId, Number(query['userId'])));
  }
  if (query['action']) {
    conditions.push(eq(auditLog.action, query['action'] as string));
  }
  if (query['resource']) {
    conditions.push(eq(auditLog.resource, query['resource'] as string));
  }
  if (query['dateFrom']) {
    conditions.push(gte(auditLog.timestamp, new Date(query['dateFrom'] as string)));
  }
  if (query['dateTo']) {
    conditions.push(lte(auditLog.timestamp, new Date(query['dateTo'] as string)));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(auditLog)
    .where(where);

  const rows = await db
    .select({
      id: auditLog.id,
      userId: auditLog.userId,
      userName: users.name,
      action: auditLog.action,
      resource: auditLog.resource,
      resourceId: auditLog.resourceId,
      details: auditLog.details,
      timestamp: auditLog.timestamp,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .where(where)
    .orderBy(desc(auditLog.timestamp))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { rows, total: count, page, pageSize };
});
