import { defineEventHandler } from 'h3';
import { db } from '../../../../db';
import { customers } from '../../../../db/schema';
import { sql, asc, desc, ilike, eq, and, or, SQL } from 'drizzle-orm';
import { parsePaginationParams } from '../../../../utils/pagination';

export default defineEventHandler(async (event) => {
  const params = parsePaginationParams(event);
  const conditions: SQL[] = [];

  if (params.search) {
    conditions.push(
      or(
        ilike(customers.company, `%${params.search}%`),
        ilike(customers.contactName, `%${params.search}%`),
        ilike(customers.email, `%${params.search}%`)
      )!
    );
  }

  if (params.filters['status']) {
    conditions.push(eq(customers.status, params.filters['status']));
  }
  if (params.filters['tier']) {
    conditions.push(eq(customers.tier, params.filters['tier']));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(customers)
    .where(where);

  const columnMap: Record<string, any> = {
    id: customers.id,
    company: customers.company,
    contactName: customers.contactName,
    email: customers.email,
    status: customers.status,
    tier: customers.tier,
    revenue: customers.revenue,
    createdAt: customers.createdAt,
  };
  const sortCol = columnMap[params.sortField] || customers.id;
  const orderBy = params.sortOrder === 'desc' ? desc(sortCol) : asc(sortCol);

  const rows = await db
    .select()
    .from(customers)
    .where(where)
    .orderBy(orderBy)
    .limit(params.pageSize)
    .offset((params.page - 1) * params.pageSize);

  return { rows, total: count, page: params.page, pageSize: params.pageSize };
});
