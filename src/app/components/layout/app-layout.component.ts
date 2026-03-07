import { Component, signal } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent],
  template: `
    <div class="min-h-screen bg-slate-950 text-white">
      <app-sidebar [collapsed]="sidebarCollapsed()" />
      <div
        class="transition-all duration-300"
        [class.ml-64]="!sidebarCollapsed()"
        [class.ml-16]="sidebarCollapsed()"
      >
        <app-topbar (toggleSidebar)="sidebarCollapsed.set(!sidebarCollapsed())" />
        <main class="p-6">
          <ng-content />
        </main>
      </div>
    </div>
  `,
})
export class AppLayoutComponent {
  sidebarCollapsed = signal(false);
}
