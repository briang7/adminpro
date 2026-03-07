import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridReadyEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  GridApi,
  themeQuartz,
  colorSchemeDark,
} from 'ag-grid-community';
import { AppLayoutComponent } from '../../components/layout/app-layout.component';
import { RouteMeta } from '@analogjs/router';
import { authGuard } from '../../guards/auth.guard';
import { firstValueFrom } from 'rxjs';

export const routeMeta: RouteMeta = {
  canActivate: [authGuard],
};

interface Role {
  id: number;
  name: string;
}

@Component({
  standalone: true,
  imports: [AppLayoutComponent, AgGridAngular, FormsModule],
  template: `
    <app-layout>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">Users</h1>
          <button
            (click)="openPanel()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            New User
          </button>
        </div>
        <ag-grid-angular
          style="height: 75vh; width: 100%;"
          [theme]="theme"
          [columnDefs]="columnDefs"
          [defaultColDef]="defaultColDef"
          [rowModelType]="'serverSide'"
          [pagination]="true"
          [paginationPageSize]="50"
          [cacheBlockSize]="50"
          (gridReady)="onGridReady($event)"
        />
      </div>

      <!-- Slide-over Panel -->
      @if (panelOpen()) {
        <div class="fixed inset-0 z-50 flex justify-end">
          <div class="absolute inset-0 bg-black/50" (click)="closePanel()"></div>
          <div class="relative w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-xl p-6 overflow-y-auto animate-slide-in">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-white">New User</h2>
              <button (click)="closePanel()" class="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <form (ngSubmit)="createUser()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input
                  [(ngModel)]="newUser.name" name="name" required
                  class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  [(ngModel)]="newUser.email" name="email" type="email" required
                  class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                  [(ngModel)]="newUser.password" name="password" type="password" required
                  class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select
                  [(ngModel)]="newUser.roleId" name="roleId"
                  class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option [ngValue]="null">No role</option>
                  @for (role of roles(); track role.id) {
                    <option [ngValue]="role.id">{{ role.name }}</option>
                  }
                </select>
              </div>
              @if (panelError()) {
                <p class="text-red-400 text-sm">{{ panelError() }}</p>
              }
              <div class="flex gap-3 pt-2">
                <button
                  type="submit"
                  class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  (click)="closePanel()"
                  class="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </app-layout>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.25s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `],
})
export default class UsersPage {
  private http = inject(HttpClient);
  private gridApi!: GridApi;

  theme = themeQuartz.withPart(colorSchemeDark);
  panelOpen = signal(false);
  panelError = signal('');
  roles = signal<Role[]>([]);

  newUser = { name: '', email: '', password: '', roleId: null as number | null };

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: true,
    minWidth: 100,
  };

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', maxWidth: 80, filter: 'agNumberColumnFilter' },
    { field: 'name', headerName: 'Name', filter: 'agTextColumnFilter' },
    { field: 'email', headerName: 'Email', filter: 'agTextColumnFilter' },
    { field: 'roleName', headerName: 'Role', filter: 'agTextColumnFilter' },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => {
        if (!params.value) return 'Never';
        return new Date(params.value).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        });
      },
    },
    {
      headerName: 'Actions',
      maxWidth: 120,
      filter: false,
      sortable: false,
      cellRenderer: (params: any) => {
        const btn = document.createElement('button');
        btn.textContent = 'Delete';
        btn.className = 'px-2 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded text-xs font-medium transition-colors';
        btn.onclick = () => this.deleteUser(params.data.id, params.data.name);
        return btn;
      },
    },
  ];

  constructor() {
    this.loadRoles();
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    event.api.setGridOption('serverSideDatasource', this.createDatasource());
  }

  openPanel(): void {
    this.newUser = { name: '', email: '', password: '', roleId: null };
    this.panelError.set('');
    this.panelOpen.set(true);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  async loadRoles(): Promise<void> {
    try {
      const roles = await firstValueFrom(this.http.get<Role[]>('/api/v1/roles'));
      this.roles.set(roles);
    } catch (e) {
      console.error('Failed to load roles:', e);
    }
  }

  async createUser(): Promise<void> {
    this.panelError.set('');
    try {
      await firstValueFrom(this.http.post('/api/v1/users', this.newUser));
      this.closePanel();
      this.gridApi?.refreshServerSide({ purge: true });
    } catch (err: any) {
      this.panelError.set(err?.error?.statusMessage || 'Failed to create user');
    }
  }

  async deleteUser(id: number, name: string): Promise<void> {
    if (!confirm(`Delete user "${name}"?`)) return;
    try {
      await firstValueFrom(this.http.delete(`/api/v1/users/${id}`));
      this.gridApi?.refreshServerSide({ purge: true });
    } catch (err: any) {
      alert(err?.error?.statusMessage || 'Failed to delete user');
    }
  }

  private createDatasource(): IServerSideDatasource {
    const http = this.http;
    return {
      getRows(params: IServerSideGetRowsParams): void {
        const { startRow = 0, sortModel, filterModel } = params.request;
        const page = Math.floor(startRow / 50) + 1;

        let url = `/api/v1/users?page=${page}&pageSize=50`;

        if (sortModel && sortModel.length > 0) {
          url += `&sortField=${sortModel[0].colId}&sortOrder=${sortModel[0].sort}`;
        }

        if (filterModel) {
          const fm = filterModel as Record<string, any>;
          if (fm['name']?.filter) {
            url += `&search=${encodeURIComponent(fm['name'].filter)}`;
          } else if (fm['email']?.filter) {
            url += `&search=${encodeURIComponent(fm['email'].filter)}`;
          }
        }

        firstValueFrom(
          http.get<{ rows: any[]; total: number }>(url)
        ).then((response) => {
          params.success({
            rowData: response.rows,
            rowCount: response.total,
          });
        }).catch(() => {
          params.fail();
        });
      },
    };
  }
}
