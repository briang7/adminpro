import { defineEventHandler, createError } from 'h3';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import { getAuthFromEvent } from '../../../../utils/auth';

export default defineEventHandler(async (event) => {
  const auth = getAuthFromEvent(event);
  if (!auth) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, auth.userId),
    with: { role: true },
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role?.name,
    avatarUrl: user.avatarUrl,
  };
});
