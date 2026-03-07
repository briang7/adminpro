import { defineEventHandler, readBody, createError } from 'h3';
import { hashSync } from 'bcryptjs';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name: string;
    email: string;
    password: string;
    roleId?: number;
  }>(event);

  if (!body?.name || !body?.email || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'name, email, and password are required' });
  }

  const passwordHash = hashSync(body.password, 10);

  const [created] = await db
    .insert(users)
    .values({
      name: body.name,
      email: body.email,
      passwordHash,
      roleId: body.roleId || null,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      createdAt: users.createdAt,
    });

  return created;
});
