import { defineEventHandler, getRequestURL } from 'h3';
import { getAuthFromEvent } from '../utils/auth';

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const path = url.pathname;

  // Only parse auth for API routes
  if (!path.startsWith('/api/v1/')) {
    return;
  }

  const auth = getAuthFromEvent(event);
  if (auth) {
    event.context['auth'] = auth;
  }
});
