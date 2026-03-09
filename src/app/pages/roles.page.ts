import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppLayoutComponent } from '../components/layout/app-layout.component';
import { firstValueFrom } from 'rxjs';

interface RoleWithPermissions {
  id: number;
  name: string;
  description: string | null;
  permissions: { resource: string; action: string }[];
}

const RESOURCES = ['customers', 'orders', 'products', 'users', 'roles', 'dashboard'];
const ACTIONS = ['create', 'read', 'update', 'delete'];

@Component({
  standalone: true,
  imports: [AppLayoutComponent],
  template: `
    <app-layout>
      <div class="space-y-4">
        <h1 class="text-2xl font-bold">Roles & Permissions</h1>

        @if (loading()) {
          <div class="text-slate-400">Loading...</div>
        } @else {
          <div class="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-700">
                    <th class="px-4 py-3 text-left text-slate-400 font-medium w-48">Resource / Action</th>
                    @for (role of roles(); track role.id) {
                      <th class="px-4 py-3 text-center text-white font-medium capitalize">{{ role.name }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (resource of resources; track resource) {
                    @for (action of actions; track action; let first = $first) {
                      <tr class="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        @if (first) {
                          <td class="px-4 py-2 text-slate-300 font-medium capitalize" [attr.rowspan]="actions.length">
                            {{ resource }}
                          </td>
                        }
                        @for (role of roles(); track role.id) {
                          <td class="px-4 py-2 text-center">
                            <label class="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                [checked]="hasPermission(role, resource, action)"
                                (change)="togglePermission(role, resource, action)"
                                class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                              />
                              <span class="text-slate-400 text-xs capitalize">{{ action }}</span>
                            </label>
                          </td>
                        }
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </div>

          @if (saving()) {
            <div class="text-blue-400 text-sm">Saving...</div>
          }
          @if (error()) {
            <div class="text-red-400 text-sm">{{ error() }}</div>
          }
        }
      </div>
    </app-layout>
  `,
})
export default class RolesPage implements OnInit {
  private http = inject(HttpClient);

  loading = signal(true);
  saving = signal(false);
  error = signal('');
  roles = signal<RoleWithPermissions[]>([]);

  resources = RESOURCES;
  actions = ACTIONS;

  async ngOnInit(): Promise<void> {
    await this.loadRoles();
    this.loading.set(false);
  }

  async loadRoles(): Promise<void> {
    try {
      const roles = await firstValueFrom(
        this.http.get<RoleWithPermissions[]>('/api/v1/roles')
      );
      this.roles.set(roles);
    } catch (e) {
      console.error('Failed to load roles:', e);
    }
  }

  hasPermission(role: RoleWithPermissions, resource: string, action: string): boolean {
    return role.permissions.some((p) => p.resource === resource && p.action === action);
  }

  async togglePermission(role: RoleWithPermissions, resource: string, action: string): Promise<void> {
    this.error.set('');
    this.saving.set(true);

    const has = this.hasPermission(role, resource, action);
    let newPermissions: { resource: string; action: string }[];

    if (has) {
      newPermissions = role.permissions.filter(
        (p) => !(p.resource === resource && p.action === action)
      );
    } else {
      newPermissions = [...role.permissions, { resource, action }];
    }

    // Optimistic update
    const updatedRoles = this.roles().map((r) =>
      r.id === role.id ? { ...r, permissions: newPermissions } : r
    );
    this.roles.set(updatedRoles);

    try {
      await firstValueFrom(
        this.http.put(`/api/v1/roles/${role.id}`, { permissions: newPermissions })
      );
    } catch (err: any) {
      this.error.set(err?.error?.statusMessage || 'Failed to update permissions');
      // Revert on failure
      await this.loadRoles();
    } finally {
      this.saving.set(false);
    }
  }
}
