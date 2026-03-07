import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <p class="text-sm text-slate-400 mb-1">{{ title() }}</p>
      <p class="text-3xl font-bold text-white">{{ formattedValue() }}</p>
    </div>
  `,
})
export class KpiCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  format = input<'currency' | 'number'>('number');

  formattedValue = computed(() => {
    const v = Number(this.value());
    if (this.format() === 'currency') {
      return `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return v.toLocaleString();
  });
}
