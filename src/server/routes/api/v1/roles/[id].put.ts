import { defineEventHandler, readBody, getRouterParam, createError } from 'h3';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { roles, permissions } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid role ID' });
  }

  const body = await readBody<{
    permissions: { resource: string; action: string }[];
  }>(event);

  if (!body?.permissions || !Array.isArray(body.permissions)) {
    throw createError({ statusCode: 400, statusMessage: 'permissions array is required' });
  }

  // Verify role exists
  const [role] = await db.select().from(roles).where(eq(roles.id, id));
  if (!role) {
    throw createError({ statusCode: 404, statusMessage: 'Role not found' });
  }

  // Delete existing permissions for this role
  await db.delete(permissions).where(eq(permissions.roleId, id));

  // Insert new permissions
  if (body.permissions.length > 0) {
    await db.insert(permissions).values(
      body.permissions.map((p) => ({
        roleId: id,
        resource: p.resource,
        action: p.action,
      }))
    );
  }

  // Return updated role with permissions
  const updatedPermissions = await db
    .select()
    .from(permissions)
    .where(eq(permissions.roleId, id));

  return {
    ...role,
    permissions: updatedPermissions.map((p) => ({ resource: p.resource, action: p.action })),
  };
});
