import { defineEventHandler, readBody, createError } from 'h3';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import { createToken, setAuthCookie, verifyPassword } from '../../../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event);

  if (!body?.email || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password required' });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, body.email),
    with: { role: true },
  });

  if (!user || !verifyPassword(body.password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }

  await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));

  const token = createToken({
    userId: user.id,
    email: user.email,
    role: user.role?.name || 'Viewer',
  });

  setAuthCookie(event, token);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role?.name,
      avatarUrl: user.avatarUrl,
    },
  };
});
