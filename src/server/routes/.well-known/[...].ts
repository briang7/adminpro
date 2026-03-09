import { defineEventHandler } from 'h3';

// Catch-all for .well-known requests (Chrome DevTools probes)
export default defineEventHandler(() => ({}));
