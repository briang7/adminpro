import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="group relative bg-gradient-to-br from-slate-800 to-slate-800/80 rounded-xl p-6 border border-slate-700/50
                hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50 overflow-hidden">
      <!-- Accent glow -->
      <div class="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:opacity-20"
           [style.background]="'radial-gradient(circle, ' + accentColor() + ', transparent)'"></div>

      <div class="relative">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-medium text-slate-400">{{ title() }}</p>
          @if (changePercent()) {
            <span class="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                  [class]="changePercent()! > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'">
              <svg class="w-3 h-3" [class.rotate-180]="changePercent()! < 0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path d="M7 17l5-5 5 5M7 7l5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ changePercent()! > 0 ? '+' : '' }}{{ changePercent() }}%
            </span>
          }
        </div>
        <p class="text-3xl font-bold text-white tracking-tight">{{ formattedValue() }}</p>
      </div>
    </div>
  `,
})
export class KpiCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  format = input<'currency' | 'number'>('number');
  changePercent = input<number | null>(null);
  color = input<string>('#3b82f6');

  accentColor = computed(() => this.color());

  formattedValue = computed(() => {
    const v = Number(this.value());
    if (this.format() === 'currency') {
      return `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return v.toLocaleString();
  });
}
