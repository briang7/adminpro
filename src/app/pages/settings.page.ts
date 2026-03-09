import { Component, inject } from '@angular/core';
import { RouteMeta } from '@analogjs/router';
import { AuthStore } from '../stores/auth.store';
import { UIStore } from '../stores/ui.store';
import { AppLayoutComponent } from '../components/layout/app-layout.component';

export const routeMeta: RouteMeta = {
  title: 'Settings | AdminPro',
};

@Component({
  standalone: true,
  imports: [AppLayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-6 max-w-2xl">
        <h1 class="text-2xl font-bold text-white">Settings</h1>

        <!-- Profile Section -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 class="text-lg font-semibold text-white mb-4">Profile</h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-slate-400">Name</span>
              <span class="text-white">{{ authStore.userName() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Email</span>
              <span class="text-white">{{ authStore.user()?.email }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Role</span>
              <span class="text-white">{{ authStore.userRole() }}</span>
            </div>
          </div>
        </div>

        <!-- Appearance Section -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 class="text-lg font-semibold text-white mb-4">Appearance</h2>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-white">Dark Mode</p>
              <p class="text-sm text-slate-400">Use dark theme across the app</p>
            </div>
            <button
              (click)="uiStore.setTheme(uiStore.theme() === 'dark' ? 'light' : 'dark')"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              [class]="uiStore.theme() === 'dark' ? 'bg-blue-600' : 'bg-slate-600'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                [class.translate-x-6]="uiStore.theme() === 'dark'"
                [class.translate-x-1]="uiStore.theme() !== 'dark'"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </app-layout>
  `,
})
export default class SettingsPage {
  authStore = inject(AuthStore);
  uiStore = inject(UIStore);
}
