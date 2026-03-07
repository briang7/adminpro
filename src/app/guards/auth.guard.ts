import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

export const authGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    await authStore.checkAuth();
  }

  if (!authStore.isAuthenticated()) {
    router.navigate(['/auth']);
    return false;
  }

  return true;
};
