import { Component, inject, OnInit, signal } from '@angular/core';
import { AppLayoutComponent } from '../components/layout/app-layout.component';
import { DashboardStore } from '../stores/dashboard.store';
import { DashboardCanvasComponent } from '../components/dashboard-widgets/dashboard-canvas.component';
import { WidgetPaletteComponent } from '../components/dashboard-widgets/widget-palette.component';

@Component({
  standalone: true,
  imports: [AppLayoutComponent, DashboardCanvasComponent, WidgetPaletteComponent],
  template: `
    <app-layout>
      <div class="space-y-6">
        <!-- Header row -->
        <div class="flex items-center justify-between flex-wrap gap-3">
          <h1 class="text-2xl font-bold text-white">Dashboard</h1>

          <div class="flex items-center gap-2 flex-wrap">
            <!-- Date range buttons -->
            @for (range of dateRanges; track range.days) {
              <button
                (click)="dashboardStore.setDateRange(range.days)"
                class="px-3 py-1.5 text-sm rounded-lg transition-colors"
                [class]="dashboardStore.dateRange() === range.days
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
              >
                {{ range.label }}
              </button>
            }

            <div class="w-px h-6 bg-slate-700 mx-1"></div>

            <!-- Layout dropdown -->
            @if (dashboardStore.savedLayouts().length > 0) {
              <div class="relative">
                <button
                  (click)="showLayoutMenu.set(!showLayoutMenu())"
                  class="px-3 py-1.5 text-sm rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors
                         flex items-center gap-1.5"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/>
                  </svg>
                  Layouts
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                @if (showLayoutMenu()) {
                  <div class="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700
                              rounded-lg shadow-xl z-30 py-1">
                    @for (layout of dashboardStore.savedLayouts(); track layout.id) {
                      <button
                        (click)="applyLayout(layout)"
                        class="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        {{ layout.name }}
                      </button>
                    }
                  </div>
                }
              </div>
            }

            <!-- Save layout (edit mode only) -->
            @if (editMode()) {
              <button
                (click)="promptSaveLayout()"
                class="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors
                       flex items-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" stroke-linecap="round"/>
                  <path d="M9 21v-6h6v6M9 3v4h4" stroke-linecap="round"/>
                </svg>
                Save Layout
              </button>
            }

            <!-- Edit toggle -->
            <button
              (click)="toggleEditMode()"
              class="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5"
              [class]="editMode()
                ? 'bg-amber-600 text-white hover:bg-amber-500'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
            >
              @if (editMode()) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Done Editing
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Edit Dashboard
              }
            </button>
          </div>
        </div>

        @if (dashboardStore.stats()) {
          <!-- Main content area -->
          <div class="flex gap-4">
            <!-- Canvas -->
            <div class="flex-1 min-w-0">
              <app-dashboard-canvas [editMode]="editMode()" />
            </div>

            <!-- Palette sidebar (edit mode only) -->
            @if (editMode()) {
              <div class="shrink-0 animate-slide-in-right">
                <app-widget-palette />
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-20 text-slate-400">Loading dashboard...</div>
        }
      </div>
    </app-layout>
  `,
  styles: [`
    @keyframes slide-in-right {
      from { opacity: 0; transform: translateX(1rem); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.2s ease-out;
    }
  `],
})
export default class DashboardPage implements OnInit {
  dashboardStore = inject(DashboardStore);
  editMode = signal(false);
  showLayoutMenu = signal(false);

  dateRanges = [
    { label: '7d', days: 7 },
    { label: '30d', days: 30 },
    { label: '90d', days: 90 },
    { label: '1y', days: 365 },
  ];

  ngOnInit() {
    this.dashboardStore.loadStats();
    this.dashboardStore.loadSavedLayouts();
  }

  toggleEditMode() {
    this.editMode.update((v) => !v);
    this.showLayoutMenu.set(false);
  }

  promptSaveLayout() {
    const name = prompt('Layout name:');
    if (name?.trim()) {
      this.dashboardStore.saveLayout(name.trim());
      // Reload saved layouts after save
      setTimeout(() => this.dashboardStore.loadSavedLayouts(), 500);
    }
  }

  applyLayout(layout: any) {
    this.dashboardStore.applyLayout(layout);
    this.showLayoutMenu.set(false);
  }
}
