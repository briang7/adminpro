import { Component, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
      class="fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-700/50 transition-all duration-300 z-30"
      [class.w-64]="!collapsed()"
      [class.w-16]="collapsed()"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-4 border-b border-slate-700/50">
        @if (!collapsed()) {
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <svg class="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h8m-8 6h16" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-white tracking-tight">AdminPro</span>
          </div>
        } @else {
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center mx-auto">
            <span class="text-white font-bold text-sm">A</span>
          </div>
        }
      </div>

      <nav class="p-2 space-y-5 mt-3">
        @for (group of navGroups; track group.label) {
          @if (!collapsed()) {
            <p class="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{{ group.label }}</p>
          }
          <div class="space-y-0.5">
            @for (item of group.items; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="!bg-blue-600/15 !text-blue-400 !border-blue-500/30"
                [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 transition-all duration-200 border border-transparent"
                [class.justify-center]="collapsed()"
              >
                <span class="w-[18px] h-[18px] shrink-0 [&>svg]:w-full [&>svg]:h-full" [innerHTML]="getSvgIcon(item.icon)"></span>
                @if (!collapsed()) {
                  <span class="text-[13px] font-medium">{{ item.label }}</span>
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
  private sanitizer = inject(DomSanitizer);
  collapsed = input(false);

  getSvgIcon(pathContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">${pathContent}</svg>`
    );
  }

  navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: '<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" stroke-linecap="round" stroke-linejoin="round"/>',
        },
      ],
    },
    {
      label: 'Data',
      items: [
        {
          label: 'Customers',
          path: '/data/customers',
          icon: '<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round"/>',
        },
        {
          label: 'Orders',
          path: '/data/orders',
          icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" stroke-linecap="round" stroke-linejoin="round"/>',
        },
        {
          label: 'Products',
          path: '/data/products',
          icon: '<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke-linecap="round" stroke-linejoin="round"/>',
        },
      ],
    },
    {
      label: 'Admin',
      items: [
        {
          label: 'Users',
          path: '/users',
          icon: '<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round"/>',
        },
        {
          label: 'Roles',
          path: '/roles',
          icon: '<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round"/>',
        },
        {
          label: 'Audit Log',
          path: '/audit',
          icon: '<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>',
        },
      ],
    },
    {
      label: 'System',
      items: [
        {
          label: 'Settings',
          path: '/settings',
          icon: '<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round"/>',
        },
      ],
    },
  ];
}
