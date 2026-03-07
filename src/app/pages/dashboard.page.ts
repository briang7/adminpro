import { Component, inject, OnInit } from '@angular/core';
import { AppLayoutComponent } from '../components/layout/app-layout.component';
import { DashboardStore } from '../stores/dashboard.store';
import { KpiCardComponent } from '../components/dashboard-widgets/kpi-card.component';
import { ChartWidgetComponent } from '../components/dashboard-widgets/chart-widget.component';

@Component({
  standalone: true,
  imports: [AppLayoutComponent, KpiCardComponent, ChartWidgetComponent],
  template: `
    <app-layout>
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-white">Dashboard</h1>
          <div class="flex gap-2">
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
          </div>
        </div>

        @if (dashboardStore.stats(); as stats) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <app-kpi-card title="Total Revenue" [value]="stats.kpis.totalRevenue" format="currency" />
            <app-kpi-card title="Active Customers" [value]="stats.kpis.activeCustomers" format="number" />
            <app-kpi-card title="Recent Orders" [value]="stats.kpis.recentOrders" format="number" />
            <app-kpi-card title="Avg Order Value" [value]="stats.kpis.avgOrderValue" format="currency" />
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div class="lg:col-span-8 h-80">
              <app-chart-widget
                title="Revenue Trend"
                chartType="line"
                [labels]="getLabels(stats.charts.revenueByMonth, 'month')"
                [values]="getValues(stats.charts.revenueByMonth, 'revenue')"
              />
            </div>
            <div class="lg:col-span-4 h-80">
              <app-chart-widget
                title="Orders by Status"
                chartType="pie"
                [labels]="getLabels(stats.charts.ordersByStatus, 'status')"
                [values]="getValues(stats.charts.ordersByStatus, 'count')"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="h-72">
              <app-chart-widget
                title="Customers by Tier"
                chartType="bar"
                [labels]="getLabels(stats.charts.customersByTier, 'tier')"
                [values]="getValues(stats.charts.customersByTier, 'count')"
              />
            </div>
          </div>
        } @else {
          <div class="text-center py-20 text-slate-400">Loading dashboard...</div>
        }
      </div>
    </app-layout>
  `,
})
export default class DashboardPage implements OnInit {
  dashboardStore = inject(DashboardStore);

  dateRanges = [
    { label: '7d', days: 7 },
    { label: '30d', days: 30 },
    { label: '90d', days: 90 },
    { label: '1y', days: 365 },
  ];

  ngOnInit() {
    this.dashboardStore.loadStats();
  }

  getLabels(data: any[], key: string): string[] {
    return data.map((d) => d[key]);
  }

  getValues(data: any[], key: string): number[] {
    return data.map((d) => Number(d[key]));
  }
}
