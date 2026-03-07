import { Component, input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartType, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="bg-slate-800 rounded-xl p-6 border border-slate-700 h-full">
      <h3 class="text-sm font-medium text-slate-300 mb-4">{{ title() }}</h3>
      <div class="h-[calc(100%-2rem)]">
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

  chartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
    },
  };

  ngOnChanges(_changes: SimpleChanges) {
    this.chartData = {
      labels: this.labels(),
      datasets: [{
        data: this.values(),
        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'],
        borderColor: '#3b82f6',
        tension: 0.3,
        fill: this.chartType() === 'line',
      }],
    };

    if (this.chartType() === 'pie' || this.chartType() === 'doughnut') {
      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { color: '#94a3b8' } },
        },
      };
    }
  }
}
