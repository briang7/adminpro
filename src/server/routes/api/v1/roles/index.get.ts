import { defineEventHandler } from 'h3';
import { db } from '../../../../db';
import { roles, permissions } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async () => {
  const allRoles = await db.select().from(roles);

  const allPermissions = await db.select().from(permissions);

  const rolesWithPermissions = allRoles.map((role) => ({
    ...role,
    permissions: allPermissions
      .filter((p) => p.roleId === role.id)
      .map((p) => ({ resource: p.resource, action: p.action })),
  }));

  return rolesWithPermissions;
});
