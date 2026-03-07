import { defineEventHandler, createError, getRequestURL } from 'h3';
import { getAuthFromEvent } from '../utils/auth';

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const path = url.pathname;

  // Skip auth for login, logout, and non-API routes
  if (!path.startsWith('/api/v1/') || path.includes('/auth/login') || path.includes('/auth/logout')) {
    return;
  }

  const auth = getAuthFromEvent(event);
  if (!auth) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  }

  event.context['auth'] = auth;
});
