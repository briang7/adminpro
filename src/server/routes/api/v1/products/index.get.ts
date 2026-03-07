import { defineEventHandler } from 'h3';
import { db } from '../../../../db';
import { products } from '../../../../db/schema';
import { sql, asc, desc, ilike, eq, and, SQL } from 'drizzle-orm';
import { parsePaginationParams } from '../../../../utils/pagination';

export default defineEventHandler(async (event) => {
  const params = parsePaginationParams(event);
  const conditions: SQL[] = [];

  if (params.search) {
    conditions.push(ilike(products.name, `%${params.search}%`));
  }

  if (params.filters['category']) {
    conditions.push(eq(products.category, params.filters['category']));
  }
  if (params.filters['status']) {
    conditions.push(eq(products.status, params.filters['status']));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(where);

  const columnMap: Record<string, any> = {
    id: products.id,
    name: products.name,
    sku: products.sku,
    category: products.category,
    price: products.price,
    stock: products.stock,
    status: products.status,
  };
  const sortCol = columnMap[params.sortField] || products.id;
  const orderBy = params.sortOrder === 'desc' ? desc(sortCol) : asc(sortCol);

  const rows = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(orderBy)
    .limit(params.pageSize)
    .offset((params.page - 1) * params.pageSize);

  return { rows, total: count, page: params.page, pageSize: params.pageSize };
});
