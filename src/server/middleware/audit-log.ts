import { defineEventHandler, getRequestURL, getMethod } from 'h3';
import { db } from '../db';
import { auditLog } from '../db/schema';
import { getAuthFromEvent } from '../utils/auth';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  if (!['POST', 'PUT', 'DELETE'].includes(method)) return;

  const url = getRequestURL(event);
  if (!url.pathname.startsWith('/api/v1/') || url.pathname.includes('/auth/')) return;

  // Log after response completes
  event.node.res.on('finish', async () => {
    const auth = getAuthFromEvent(event);
    if (!auth) return;

    const pathParts = url.pathname.replace('/api/v1/', '').split('/');
    const resource = pathParts[0];
    const resourceId = pathParts.length > 1 ? Number(pathParts[1]) || null : null;
    const action = method === 'POST' ? 'create' : method === 'PUT' ? 'update' : 'delete';

    try {
      await db.insert(auditLog).values({
        userId: auth.userId,
        action,
        resource,
        resourceId,
        details: { method, path: url.pathname },
      });
    } catch (e) {
      console.error('Audit log failed:', e);
    }
  });
});
