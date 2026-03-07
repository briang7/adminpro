import { defineEventHandler, getRouterParam, createError } from 'h3';
import { eq, sql, ilike } from 'drizzle-orm';
import { db } from '../../../../db';
import { users, roles } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' });
  }

  // Check if this user is the last admin
  const [user] = await db
    .select({ roleId: users.roleId })
    .from(users)
    .where(eq(users.id, id));

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }

  if (user.roleId) {
    const [role] = await db
      .select({ name: roles.name })
      .from(roles)
      .where(eq(roles.id, user.roleId));

    if (role?.name.toLowerCase() === 'admin') {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .where(ilike(roles.name, 'admin'));

      if (count <= 1) {
        throw createError({ statusCode: 400, statusMessage: 'Cannot delete the last admin user' });
      }
    }
  }

  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning();

  return { success: true, deleted };
});
