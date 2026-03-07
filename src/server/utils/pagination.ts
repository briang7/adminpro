import { getQuery } from 'h3';
import type { H3Event } from 'h3';

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  filters: Record<string, string>;
}

export function parsePaginationParams(event: H3Event): PaginationParams {
  const query = getQuery(event);
  return {
    page: Number(query['page']) || 1,
    pageSize: Math.min(Number(query['pageSize']) || 50, 200),
    sortField: (query['sortField'] as string) || 'id',
    sortOrder: (query['sortOrder'] as 'asc' | 'desc') || 'asc',
    search: (query['search'] as string) || '',
    filters: Object.fromEntries(
      Object.entries(query)
        .filter(([k]) => k.startsWith('filter_'))
        .map(([k, v]) => [k.replace('filter_', ''), String(v)])
    ),
  };
}
