import { Component } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  standalone: true,
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      [class]="statusClass"
    >
      {{ value }}
    </span>
  `,
})
export class StatusCellComponent implements ICellRendererAngularComp {
  value = '';
  statusClass = '';

  agInit(params: ICellRendererParams): void {
    this.value = params.value;
    this.statusClass = this.getStatusClass(params.value);
  }

  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    this.statusClass = this.getStatusClass(params.value);
    return true;
  }

  private getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400',
      inactive: 'bg-slate-500/20 text-slate-400',
      prospect: 'bg-blue-500/20 text-blue-400',
      churned: 'bg-red-500/20 text-red-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      processing: 'bg-blue-500/20 text-blue-400',
      shipped: 'bg-purple-500/20 text-purple-400',
      delivered: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
      discontinued: 'bg-red-500/20 text-red-400',
      out_of_stock: 'bg-orange-500/20 text-orange-400',
    };
    return classes[status] || 'bg-slate-500/20 text-slate-400';
  }
}
