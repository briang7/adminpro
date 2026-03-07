import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-700 transition-all duration-300 z-30"
      [class.w-64]="!collapsed()"
      [class.w-16]="collapsed()"
    >
      <div class="flex items-center h-16 px-4 border-b border-slate-700">
        @if (!collapsed()) {
          <span class="text-xl font-bold text-white">AdminPro</span>
        } @else {
          <span class="text-xl font-bold text-white mx-auto">A</span>
        }
      </div>

      <nav class="p-2 space-y-4 mt-2">
        @for (group of navGroups; track group.label) {
          @if (!collapsed()) {
            <p class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ group.label }}</p>
          }
          <div class="space-y-1">
            @for (item of group.items; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-blue-600/20 text-blue-400"
                [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                [class.justify-center]="collapsed()"
              >
                <span class="text-lg" [innerHTML]="item.icon"></span>
                @if (!collapsed()) {
                  <span class="text-sm">{{ item.label }}</span>
                }
              </a>
            }
          </div>
        }
      </nav>
    </aside>
  `,
})
export class SidebarComponent {
  collapsed = input(false);

  navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: '&#9632;' },
      ],
    },
    {
      label: 'Data',
      items: [
        { label: 'Customers', path: '/data/customers', icon: '&#9679;' },
        { label: 'Orders', path: '/data/orders', icon: '&#9830;' },
        { label: 'Products', path: '/data/products', icon: '&#9733;' },
      ],
    },
    {
      label: 'Admin',
      items: [
        { label: 'Users', path: '/users', icon: '&#9824;' },
        { label: 'Roles', path: '/roles', icon: '&#9827;' },
        { label: 'Audit Log', path: '/audit', icon: '&#9998;' },
      ],
    },
    {
      label: 'System',
      items: [
        { label: 'Settings', path: '/settings', icon: '&#9881;' },
      ],
    },
  ];
}
