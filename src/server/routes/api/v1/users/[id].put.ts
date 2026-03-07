import { defineEventHandler, readBody, getRouterParam, createError } from 'h3';
import { eq } from 'drizzle-orm';
import { hashSync } from 'bcryptjs';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' });
  }

  const body = await readBody<{
    name?: string;
    email?: string;
    roleId?: number | null;
    password?: string;
  }>(event);

  if (!body || Object.keys(body).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Request body is empty' });
  }

  const updateData: Record<string, any> = {};
  if (body.name !== undefined) updateData['name'] = body.name;
  if (body.email !== undefined) updateData['email'] = body.email;
  if (body.roleId !== undefined) updateData['roleId'] = body.roleId;
  if (body.password) updateData['passwordHash'] = hashSync(body.password, 10);

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      createdAt: users.createdAt,
      lastLogin: users.lastLogin,
    });

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }

  return updated;
});
