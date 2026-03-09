import { Component, inject, input } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DashboardStore, DashboardWidget } from '../../stores/dashboard.store';
import { KpiCardComponent } from './kpi-card.component';
import { ChartWidgetComponent } from './chart-widget.component';
import type { WidgetTemplate } from './widget-palette.component';

/** Map chart data keys to their label / value field names */
const CHART_FIELD_MAP: Record<string, { labelKey: string; valueKey: string }> = {
  revenueByMonth: { labelKey: 'month', valueKey: 'revenue' },
  ordersByStatus: { labelKey: 'status', valueKey: 'count' },
  customersByTier: { labelKey: 'tier', valueKey: 'count' },
};

/** Map widget type to Chart.js chart type */
function toChartType(type: string): 'line' | 'bar' | 'pie' | 'doughnut' {
  if (type === 'line-chart') return 'line';
  if (type === 'bar-chart') return 'bar';
  if (type === 'pie-chart') return 'doughnut';
  return 'pie';
}

/** Mock change percentages for KPI widgets */
const KPI_CHANGE_MAP: Record<string, number> = {
  totalRevenue: 12.5,
  activeCustomers: 8.3,
  recentOrders: -3.2,
  avgOrderValue: 5.7,
};

/** Accent colors for KPI widgets */
const KPI_COLOR_MAP: Record<string, string> = {
  totalRevenue: '#3b82f6',
  activeCustomers: '#10b981',
  recentOrders: '#f59e0b',
  avgOrderValue: '#8b5cf6',
};

let nextWidgetId = 1;

@Component({
  selector: 'app-dashboard-canvas',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, KpiCardComponent, ChartWidgetComponent],
  template: `
    <div
      cdkDropList
      id="dashboard-canvas"
      [cdkDropListData]="dashboardStore.layout().widgets"
      [cdkDropListConnectedTo]="editMode() ? ['widget-palette'] : []"
      (cdkDropListDropped)="onDrop($event)"
      [class]="'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[200px] transition-all' + (editMode() ? ' ring-2 ring-blue-500/20 ring-dashed rounded-xl p-2' : '')"
    >
      @for (widget of dashboardStore.layout().widgets; track widget.id) {
        <div
          [cdkDragDisabled]="!editMode()"
          cdkDrag
          class="relative transition-all"
          [class]="getWidgetSpanClass(widget)"
          [class.group]="editMode()"
        >
          <!-- Edit mode overlay -->
          @if (editMode()) {
            <div
              cdkDragHandle
              class="absolute inset-0 z-10 rounded-xl cursor-grab opacity-0 group-hover:opacity-100
                     bg-blue-500/5 border-2 border-transparent group-hover:border-blue-500/30 transition-all"
            >
              <!-- Drag handle icon -->
              <div class="absolute top-2 left-2 p-1 bg-slate-700/90 rounded text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" stroke-linecap="round"></path>
                </svg>
              </div>
            </div>
            <!-- Remove button -->
            <button
              (click)="removeWidget(widget.id)"
              class="absolute -top-2 -right-2 z-20 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500
                     text-white flex items-center justify-center opacity-0 group-hover:opacity-100
                     transition-opacity shadow-lg"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round"></path>
              </svg>
            </button>
          }

          <!-- Widget content -->
          @if (widget.type === 'kpi') {
            <app-kpi-card
              [title]="widget.title"
              [value]="getKpiValue(widget)"
              [format]="widget.config['format'] || 'number'"
              [changePercent]="getKpiChange(widget)"
              [color]="getKpiColor(widget)"
            />
          } @else {
            <div [style.height]="getChartHeight(widget)">
              <app-chart-widget
                [title]="widget.title"
                [chartType]="toChartType(widget.type)"
                [labels]="getChartLabels(widget)"
                [values]="getChartValues(widget)"
              />
            </div>
          }

        </div>
      }

      <!-- Empty state when no widgets -->
      @if (dashboardStore.layout().widgets.length === 0 && editMode()) {
        <div class="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
          <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" stroke-linecap="round"></path>
          </svg>
          <p class="text-sm">Drag widgets from the palette to get started</p>
        </div>
      }
    </div>
  `,
})
export class DashboardCanvasComponent {
  dashboardStore = inject(DashboardStore);
  editMode = input(false);

  getWidgetSpanClass(widget: DashboardWidget): string {
    if (widget.type === 'kpi') return 'col-span-1';
    if (widget.gridW >= 8) return 'sm:col-span-2 lg:col-span-3';
    if (widget.gridW >= 6) return 'sm:col-span-2 lg:col-span-2';
    return 'sm:col-span-2 lg:col-span-2';
  }

  getChartHeight(widget: DashboardWidget): string {
    return widget.gridH >= 3 ? '20rem' : '18rem';
  }

  toChartType = toChartType;

  getKpiValue(widget: DashboardWidget): number | string {
    const stats = this.dashboardStore.stats();
    if (!stats) return 0;
    const metric = widget.config['metric'];
    return stats.kpis?.[metric] ?? 0;
  }

  getKpiChange(widget: DashboardWidget): number | null {
    const metric = widget.config['metric'];
    return KPI_CHANGE_MAP[metric] ?? null;
  }

  getKpiColor(widget: DashboardWidget): string {
    const metric = widget.config['metric'];
    return KPI_COLOR_MAP[metric] ?? '#3b82f6';
  }

  getChartLabels(widget: DashboardWidget): string[] {
    const stats = this.dashboardStore.stats();
    if (!stats) return [];
    const dataKey = widget.config['dataKey'];
    const data = stats.charts?.[dataKey];
    const fields = CHART_FIELD_MAP[dataKey];
    if (!data || !fields) return [];
    return data.map((d: any) => d[fields.labelKey]);
  }

  getChartValues(widget: DashboardWidget): number[] {
    const stats = this.dashboardStore.stats();
    if (!stats) return [];
    const dataKey = widget.config['dataKey'];
    const data = stats.charts?.[dataKey];
    const fields = CHART_FIELD_MAP[dataKey];
    if (!data || !fields) return [];
    return data.map((d: any) => Number(d[fields.valueKey]));
  }

  onDrop(event: CdkDragDrop<any[], any[]>) {
    if (event.previousContainer === event.container) {
      // Reorder within canvas
      const widgets = [...this.dashboardStore.layout().widgets];
      moveItemInArray(widgets, event.previousIndex, event.currentIndex);
      const reordered = widgets.map((w, i) => ({ ...w, gridY: i }));
      this.dashboardStore.applyLayout({ ...this.dashboardStore.layout(), widgets: reordered });
    } else {
      // Dropped from palette
      const template = event.item.data as WidgetTemplate;
      const id = `widget-${Date.now()}-${nextWidgetId++}`;
      const newWidget: DashboardWidget = {
        id,
        type: template.type,
        title: template.title,
        gridX: 0,
        gridY: event.currentIndex,
        gridW: template.type === 'kpi' ? 3 : 6,
        gridH: template.type === 'kpi' ? 1 : 3,
        config: { ...template.defaultConfig },
      };
      this.dashboardStore.addWidget(newWidget);
    }
  }

  removeWidget(widgetId: string) {
    this.dashboardStore.removeWidget(widgetId);
  }
}
