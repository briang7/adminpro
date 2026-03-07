import { Component, inject, output } from '@angular/core';
import { AuthStore } from '../../stores/auth.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
      <div class="flex items-center gap-4">
        <button
          (click)="toggleSidebar.emit()"
          class="text-slate-400 hover:text-white transition-colors"
        >
          &#9776;
        </button>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {{ authStore.userName().charAt(0) }}
          </div>
          <div class="hidden sm:block">
            <p class="text-sm text-white">{{ authStore.userName() }}</p>
            <p class="text-xs text-slate-400">{{ authStore.userRole() }}</p>
          </div>
        </div>
        <button
          (click)="authStore.logout()"
          class="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  authStore = inject(AuthStore);
  toggleSidebar = output();
}
