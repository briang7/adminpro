import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'line-chart' | 'bar-chart' | 'pie-chart' | 'table' | 'activity';
  title: string;
  gridX: number;
  gridY: number;
  gridW: number;
  gridH: number;
  config: Record<string, any>;
}

export interface DashboardLayout {
  id?: number;
  name: string;
  widgets: DashboardWidget[];
}

type DashboardState = {
  stats: any | null;
  layout: DashboardLayout;
  savedLayouts: DashboardLayout[];
  dateRange: number;
  isLoading: boolean;
};

const defaultWidgets: DashboardWidget[] = [
  { id: 'kpi-revenue', type: 'kpi', title: 'Total Revenue', gridX: 0, gridY: 0, gridW: 3, gridH: 1, config: { metric: 'totalRevenue', format: 'currency' } },
  { id: 'kpi-customers', type: 'kpi', title: 'Active Customers', gridX: 3, gridY: 0, gridW: 3, gridH: 1, config: { metric: 'activeCustomers', format: 'number' } },
  { id: 'kpi-orders', type: 'kpi', title: 'Recent Orders', gridX: 6, gridY: 0, gridW: 3, gridH: 1, config: { metric: 'recentOrders', format: 'number' } },
  { id: 'kpi-aov', type: 'kpi', title: 'Avg Order Value', gridX: 9, gridY: 0, gridW: 3, gridH: 1, config: { metric: 'avgOrderValue', format: 'currency' } },
  { id: 'chart-revenue', type: 'line-chart', title: 'Revenue Trend', gridX: 0, gridY: 1, gridW: 8, gridH: 3, config: { dataKey: 'revenueByMonth' } },
  { id: 'chart-orders', type: 'pie-chart', title: 'Orders by Status', gridX: 8, gridY: 1, gridW: 4, gridH: 3, config: { dataKey: 'ordersByStatus' } },
  { id: 'chart-tiers', type: 'bar-chart', title: 'Customers by Tier', gridX: 0, gridY: 4, gridW: 6, gridH: 3, config: { dataKey: 'customersByTier' } },
];

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState<DashboardState>({
    stats: null,
    layout: { name: 'Default', widgets: defaultWidgets },
    savedLayouts: [],
    dateRange: 30,
    isLoading: false,
  }),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadStats() {
      patchState(store, { isLoading: true });
      try {
        const stats = await firstValueFrom(
          http.get(`/api/v1/dashboard/stats?days=${store.dateRange()}`)
        );
        patchState(store, { stats, isLoading: false });
      } catch {
        patchState(store, { isLoading: false });
      }
    },
    setDateRange(days: number) {
      patchState(store, { dateRange: days });
      this.loadStats();
    },
    updateWidgetPosition(widgetId: string, x: number, y: number) {
      const widgets = store.layout().widgets.map((w) =>
        w.id === widgetId ? { ...w, gridX: x, gridY: y } : w
      );
      patchState(store, { layout: { ...store.layout(), widgets } });
    },
    addWidget(widget: DashboardWidget) {
      const widgets = [...store.layout().widgets, widget];
      patchState(store, { layout: { ...store.layout(), widgets } });
    },
    removeWidget(widgetId: string) {
      const widgets = store.layout().widgets.filter((w) => w.id !== widgetId);
      patchState(store, { layout: { ...store.layout(), widgets } });
    },
    async saveLayout(name: string) {
      await firstValueFrom(
        http.post('/api/v1/dashboard/configs', {
          name,
          layoutJson: { widgets: store.layout().widgets },
        })
      );
    },
    async loadSavedLayouts() {
      const configs = await firstValueFrom(
        http.get<any[]>('/api/v1/dashboard/configs')
      );
      patchState(store, {
        savedLayouts: configs.map((c: any) => ({
          id: c.id,
          name: c.name,
          widgets: c.layoutJson.widgets,
        })),
      });
    },
    applyLayout(layout: DashboardLayout) {
      patchState(store, { layout });
    },
  }))
);
