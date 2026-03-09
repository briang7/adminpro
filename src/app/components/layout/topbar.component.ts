import { Component, inject, output } from '@angular/core';
import { AuthStore } from '../../stores/auth.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="h-16 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6">
      <div class="flex items-center gap-4">
        <button
          (click)="toggleSidebar.emit()"
          class="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-3">
        <!-- Notifications bell -->
        <button class="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        <div class="w-px h-8 bg-slate-700/50 mx-1"></div>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-medium shadow-lg shadow-blue-500/20">
            {{ authStore.userName() ? authStore.userName().charAt(0).toUpperCase() : 'A' }}
          </div>
          <div class="hidden sm:block">
            <p class="text-sm font-medium text-white leading-tight">{{ authStore.userName() || 'Admin' }}</p>
            <p class="text-xs text-slate-500">{{ authStore.userRole() || 'admin' }}</p>
          </div>
        </div>
        <button
          (click)="authStore.logout()"
          class="ml-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-all border border-slate-700/50"
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
