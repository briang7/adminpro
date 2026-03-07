import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed } from '@ngrx/signals';
import { withEntities, setAllEntities, addEntity, updateEntity, removeEntity } from '@ngrx/signals/entities';
import { patchState } from '@ngrx/signals';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface PaginatedResponse<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EntityStoreState {
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  filters: Record<string, string>;
}

export function createEntityStore<T extends { id: number }>(entityName: string, apiPath: string) {
  return signalStore(
    withEntities<T>(),
    withState<EntityStoreState>({
      isLoading: false,
      error: null,
      total: 0,
      page: 1,
      pageSize: 50,
      sortField: 'id',
      sortOrder: 'asc',
      search: '',
      filters: {},
    }),
    withComputed((store) => ({
      totalPages: computed(() => Math.ceil(store.total() / store.pageSize())),
    })),
    withMethods((store, http = inject(HttpClient)) => ({
      async loadPage(params?: Partial<EntityStoreState>) {
        if (params) {
          patchState(store, params);
        }
        patchState(store, { isLoading: true, error: null });

        const queryParams = new URLSearchParams({
          page: String(store.page()),
          pageSize: String(store.pageSize()),
          sortField: store.sortField(),
          sortOrder: store.sortOrder(),
          search: store.search(),
        });

        for (const [key, val] of Object.entries(store.filters())) {
          queryParams.set(`filter_${key}`, val);
        }

        try {
          const data = await firstValueFrom(
            http.get<PaginatedResponse<T>>(`/api/v1/${apiPath}?${queryParams}`)
          );
          patchState(store, setAllEntities(data.rows), {
            total: data.total,
            page: data.page,
            pageSize: data.pageSize,
            isLoading: false,
          });
        } catch (err: any) {
          patchState(store, { isLoading: false, error: err?.message || 'Failed to load' });
        }
      },

      async create(entity: Partial<T>) {
        const created = await firstValueFrom(
          http.post<T>(`/api/v1/${apiPath}`, entity)
        );
        patchState(store, addEntity(created));
        return created;
      },

      async update(id: number, changes: Partial<T>) {
        const updated = await firstValueFrom(
          http.put<T>(`/api/v1/${apiPath}/${id}`, changes)
        );
        patchState(store, updateEntity({ id, changes: updated as any }));
        return updated;
      },

      async remove(id: number) {
        await firstValueFrom(http.delete(`/api/v1/${apiPath}/${id}`));
        patchState(store, removeEntity(id));
      },

      async bulkAction(ids: number[], action: string) {
        await firstValueFrom(
          http.post(`/api/v1/${apiPath}/bulk`, { ids, action })
        );
        await this.loadPage();
      },
    }))
  );
}
