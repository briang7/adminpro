import { defineEventHandler } from 'h3';
import { db } from '../../../../db';
import { orders, customers } from '../../../../db/schema';
import { sql, asc, desc, eq, and, SQL } from 'drizzle-orm';
import { parsePaginationParams } from '../../../../utils/pagination';

export default defineEventHandler(async (event) => {
  const params = parsePaginationParams(event);
  const conditions: SQL[] = [];

  if (params.filters['status']) {
    conditions.push(eq(orders.status, params.filters['status']));
  }
  if (params.filters['customerId']) {
    conditions.push(eq(orders.customerId, Number(params.filters['customerId'])));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(where);

  const columnMap: Record<string, any> = {
    id: orders.id,
    customerId: orders.customerId,
    amount: orders.amount,
    status: orders.status,
    itemsCount: orders.itemsCount,
    createdAt: orders.createdAt,
  };
  const sortCol = columnMap[params.sortField] || orders.id;
  const orderBy = params.sortOrder === 'desc' ? desc(sortCol) : asc(sortCol);

  const rows = await db
    .select({
      id: orders.id,
      customerId: orders.customerId,
      customerName: customers.company,
      amount: orders.amount,
      status: orders.status,
      itemsCount: orders.itemsCount,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(where)
    .orderBy(orderBy)
    .limit(params.pageSize)
    .offset((params.page - 1) * params.pageSize);

  return { rows, total: count, page: params.page, pageSize: params.pageSize };
});
