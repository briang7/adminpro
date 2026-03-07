import { Component } from '@angular/core';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

export interface WidgetTemplate {
  type: 'kpi' | 'line-chart' | 'bar-chart' | 'pie-chart';
  title: string;
  icon: string;
  defaultConfig: Record<string, any>;
}

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    type: 'kpi',
    title: 'KPI Card',
    icon: 'M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5ZM14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5Z',
    defaultConfig: { metric: 'totalRevenue', format: 'currency' },
  },
  {
    type: 'line-chart',
    title: 'Line Chart',
    icon: 'M3 17l6-6 4 4 8-8M14 7h7v7',
    defaultConfig: { dataKey: 'revenueByMonth' },
  },
  {
    type: 'bar-chart',
    title: 'Bar Chart',
    icon: 'M3 3v18h18M7 16v-4M12 16V8M17 16v-6',
    defaultConfig: { dataKey: 'customersByTier' },
  },
  {
    type: 'pie-chart',
    title: 'Pie Chart',
    icon: 'M12 2a10 10 0 1 0 10 10h-10V2ZM20 12a8 8 0 0 0-8-8v8h8Z',
    defaultConfig: { dataKey: 'ordersByStatus' },
  },
];

@Component({
  selector: 'app-widget-palette',
  standalone: true,
  imports: [CdkDropList, CdkDrag],
  template: `
    <div class="bg-slate-800 rounded-xl border border-slate-700 p-4 w-64">
      <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
        Widget Palette
      </h3>
      <div
        cdkDropList
        [cdkDropListData]="templates"
        cdkDropListSortingDisabled
        [cdkDropListConnectedTo]="['dashboard-canvas']"
        id="widget-palette"
        class="space-y-2"
      >
        @for (tpl of templates; track tpl.type) {
          <div
            cdkDrag
            [cdkDragData]="tpl"
            class="flex items-center gap-3 px-3 py-2.5 bg-slate-700/60 rounded-lg border border-slate-600
                   cursor-grab hover:bg-slate-700 hover:border-blue-500/40 transition-colors group"
          >
            <div class="w-8 h-8 rounded-md bg-blue-600/20 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path [attr.d]="tpl.icon" />
              </svg>
            </div>
            <span class="text-sm text-slate-200 group-hover:text-white">{{ tpl.title }}</span>
          </div>
        }
      </div>
      <p class="text-xs text-slate-500 mt-3">Drag widgets onto the dashboard</p>
    </div>
  `,
})
export class WidgetPaletteComponent {
  templates = WIDGET_TEMPLATES;
}
