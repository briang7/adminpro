import { defineEventHandler, getQuery } from 'h3';
import { db } from '../../../../db';
import { customers, orders, products } from '../../../../db/schema';
import { sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const days = Number(query['days']) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [customerStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${customers.status} = 'active')::int`,
    })
    .from(customers);

  const [orderStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      totalRevenue: sql<string>`coalesce(sum(${orders.amount}), 0)`,
      avgOrderValue: sql<string>`coalesce(avg(${orders.amount}), 0)`,
      recent: sql<number>`count(*) filter (where ${orders.createdAt} >= ${since})::int`,
    })
    .from(orders);

  const [productStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${products.status} = 'active')::int`,
      lowStock: sql<number>`count(*) filter (where ${products.stock} < 10)::int`,
    })
    .from(products);

  const revenueByMonth = await db
    .select({
      month: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM')`,
      revenue: sql<string>`sum(${orders.amount})`,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`);

  const ordersByStatus = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .groupBy(orders.status);

  const customersByTier = await db
    .select({
      tier: customers.tier,
      count: sql<number>`count(*)::int`,
    })
    .from(customers)
    .groupBy(customers.tier);

  return {
    kpis: {
      totalRevenue: orderStats.totalRevenue,
      activeCustomers: customerStats.active,
      recentOrders: orderStats.recent,
      avgOrderValue: orderStats.avgOrderValue,
    },
    charts: {
      revenueByMonth,
      ordersByStatus,
      customersByTier,
    },
  };
});
