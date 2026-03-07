import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../stores/auth.store';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white">AdminPro</h1>
          <p class="text-slate-400 mt-2">Enterprise Back-Office Dashboard</p>
        </div>

        <div
          class="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700"
        >
          <h2 class="text-xl font-semibold text-white mb-6">Sign In</h2>

          @if (authStore.error()) {
            <div
              class="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-3 mb-4 text-sm"
            >
              {{ authStore.error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1"
                >Email</label
              >
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                class="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@adminpro.dev"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1"
                >Password</label
              >
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                class="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Demo123!"
                required
              />
            </div>

            <button
              type="submit"
              [disabled]="authStore.isLoading()"
              class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {{ authStore.isLoading() ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="mt-6 pt-4 border-t border-slate-700">
            <p class="text-xs text-slate-500 mb-2">
              Demo accounts (password: Demo123!)
            </p>
            <div class="grid grid-cols-2 gap-2">
              @for (account of demoAccounts; track account.email) {
                <button
                  (click)="fillDemo(account.email)"
                  class="text-xs text-slate-400 hover:text-white bg-slate-700/50 rounded px-2 py-1.5 transition-colors"
                >
                  {{ account.label }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class AuthPage {
  authStore = inject(AuthStore);
  email = '';
  password = '';

  demoAccounts = [
    { email: 'admin@adminpro.dev', label: 'Admin' },
    { email: 'manager@adminpro.dev', label: 'Manager' },
    { email: 'editor@adminpro.dev', label: 'Editor' },
    { email: 'viewer@adminpro.dev', label: 'Viewer' },
  ];

  fillDemo(email: string) {
    this.email = email;
    this.password = 'Demo123!';
  }

  onSubmit() {
    this.authStore.login(this.email, this.password);
  }
}
