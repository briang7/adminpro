import { Component, input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartType } from 'chart.js';

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="bg-gradient-to-br from-slate-800 to-slate-800/80 rounded-xl p-6 border border-slate-700/50 h-full
                hover:border-slate-600 transition-all duration-300">
      <h3 class="text-sm font-semibold text-slate-300 mb-4 tracking-wide uppercase">{{ title() }}</h3>
      <div class="h-[calc(100%-2.5rem)]">
        <canvas baseChart
          [type]="chartType()"
          [data]="chartData"
          [options]="chartOptions"
        ></canvas>
      </div>
    </div>
  `,
})
export class ChartWidgetComponent implements OnChanges {
  title = input.required<string>();
  chartType = input.required<ChartType>();
  labels = input.required<string[]>();
  values = input.required<number[]>();

  chartData: any = { labels: [], datasets: [] };
  chartOptions: any = {};

  private readonly palette = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
    '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
  ];

  ngOnChanges(_changes: SimpleChanges) {
    const type = this.chartType();

    if (type === 'line') {
      this.chartData = {
        labels: this.labels(),
        datasets: [{
          data: this.values(),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#3b82f6',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        }],
      };
      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeInOutQuart' },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
          },
        },
        scales: {
          x: {
            ticks: { color: '#64748b', font: { size: 11 }, maxRotation: 0 },
            grid: { display: false },
            border: { display: false },
          },
          y: {
            ticks: { color: '#64748b', font: { size: 11 }, padding: 8 },
            grid: { color: 'rgba(51, 65, 85, 0.3)', lineWidth: 1 },
            border: { display: false, dash: [4, 4] },
          },
        },
      };
    } else if (type === 'pie' || type === 'doughnut') {
      this.chartData = {
        labels: this.labels(),
        datasets: [{
          data: this.values(),
          backgroundColor: this.palette.slice(0, this.values().length).map(c => c + 'cc'),
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 8,
        }],
      };
      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeInOutQuart' },
        cutout: type === 'doughnut' ? '60%' : undefined,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              color: '#94a3b8',
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { size: 12 },
            },
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
          },
        },
      };
    } else {
      // bar chart
      this.chartData = {
        labels: this.labels(),
        datasets: [{
          data: this.values(),
          backgroundColor: this.palette.slice(0, this.values().length).map(c => c + '99'),
          borderColor: this.palette.slice(0, this.values().length),
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: this.palette.slice(0, this.values().length),
        }],
      };
      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeInOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            ticks: { color: '#64748b', font: { size: 12 } },
            grid: { display: false },
            border: { display: false },
          },
          y: {
            ticks: { color: '#64748b', font: { size: 11 }, padding: 8 },
            grid: { color: 'rgba(51, 65, 85, 0.3)' },
            border: { display: false },
          },
        },
      };
    }
  }
}
