import { defineEventHandler } from 'h3';
import { db } from '../../../../db';
import { users, roles } from '../../../../db/schema';
import { sql, asc, desc, ilike, eq, and, or, SQL } from 'drizzle-orm';
import { parsePaginationParams } from '../../../../utils/pagination';

export default defineEventHandler(async (event) => {
  const params = parsePaginationParams(event);
  const conditions: SQL[] = [];

  if (params.search) {
    conditions.push(
      or(
        ilike(users.name, `%${params.search}%`),
        ilike(users.email, `%${params.search}%`)
      )!
    );
  }

  if (params.filters['roleId']) {
    conditions.push(eq(users.roleId, Number(params.filters['roleId'])));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(where);

  const columnMap: Record<string, any> = {
    id: users.id,
    name: users.name,
    email: users.email,
    roleId: users.roleId,
    createdAt: users.createdAt,
    lastLogin: users.lastLogin,
  };
  const sortCol = columnMap[params.sortField] || users.id;
  const orderBy = params.sortOrder === 'desc' ? desc(sortCol) : asc(sortCol);

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      roleName: roles.name,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
      lastLogin: users.lastLogin,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(where)
    .orderBy(orderBy)
    .limit(params.pageSize)
    .offset((params.page - 1) * params.pageSize);

  return { rows, total: count, page: params.page, pageSize: params.pageSize };
});
