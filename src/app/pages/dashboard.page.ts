import { Component } from '@angular/core';
import { AppLayoutComponent } from '../components/layout/app-layout.component';

@Component({
  standalone: true,
  imports: [AppLayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-4">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-slate-400">Dashboard content coming soon...</p>
      </div>
    </app-layout>
  `,
})
export default class DashboardPage {}
