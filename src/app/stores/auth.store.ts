import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AuthService, UserProfile } from '../services/auth.service';
import { Router } from '@angular/router';

type AuthState = {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => store.user() !== null),
    userRole: computed(() => store.user()?.role ?? null),
    userName: computed(() => store.user()?.name ?? ''),
  })),
  withMethods(
    (store, authService = inject(AuthService), router = inject(Router)) => ({
      async login(email: string, password: string) {
        patchState(store, { isLoading: true, error: null });
        try {
          const { user } = await authService.login(email, password);
          patchState(store, { user, isLoading: false });
          router.navigate(['/dashboard']);
        } catch (err: any) {
          patchState(store, {
            isLoading: false,
            error: err?.error?.statusMessage || 'Login failed',
          });
        }
      },
      async logout() {
        await authService.logout();
        patchState(store, { user: null });
        router.navigate(['/']);
      },
      async checkAuth() {
        try {
          const user = await authService.me();
          patchState(store, { user });
        } catch {
          patchState(store, { user: null });
        }
      },
    })
  )
);
