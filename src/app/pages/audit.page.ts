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
import { AppLayoutComponent } from '../components/layout/app-layout.component';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  imports: [AppLayoutComponent, AgGridAngular, FormsModule],
  template: `
    <app-layout>
      <div class="space-y-4">
        <h1 class="text-2xl font-bold">Audit Log</h1>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3">
          <select
            [(ngModel)]="filterAction"
            (ngModelChange)="refreshGrid()"
            class="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>

          <select
            [(ngModel)]="filterResource"
            (ngModelChange)="refreshGrid()"
            class="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Resources</option>
            <option value="customers">Customers</option>
            <option value="orders">Orders</option>
            <option value="products">Products</option>
            <option value="users">Users</option>
            <option value="roles">Roles</option>
          </select>

          <button
            (click)="clearFilters()"
            class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <ag-grid-angular
          style="height: 70vh; width: 100%;"
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
    </app-layout>
  `,
})
export default class AuditPage {
  private http = inject(HttpClient);
  private gridApi!: GridApi;

  theme = themeQuartz.withPart(colorSchemeDark);

  filterAction = '';
  filterResource = '';

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: false,
    minWidth: 100,
  };

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', maxWidth: 80 },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      minWidth: 180,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
      },
    },
    { field: 'userName', headerName: 'User', minWidth: 140 },
    {
      field: 'action',
      headerName: 'Action',
      maxWidth: 110,
      cellRenderer: (params: any) => {
        const span = document.createElement('span');
        span.textContent = params.value;
        const colors: Record<string, string> = {
          create: 'bg-green-600/20 text-green-400',
          update: 'bg-blue-600/20 text-blue-400',
          delete: 'bg-red-600/20 text-red-400',
        };
        span.className = `px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[params.value] || ''}`;
        return span;
      },
    },
    { field: 'resource', headerName: 'Resource', maxWidth: 130 },
    { field: 'resourceId', headerName: 'Resource ID', maxWidth: 110 },
    {
      field: 'details',
      headerName: 'Details',
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return typeof params.value === 'string' ? params.value : JSON.stringify(params.value);
      },
    },
  ];

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    event.api.setGridOption('serverSideDatasource', this.createDatasource());
  }

  refreshGrid(): void {
    this.gridApi?.refreshServerSide({ purge: true });
  }

  clearFilters(): void {
    this.filterAction = '';
    this.filterResource = '';
    this.refreshGrid();
  }

  private createDatasource(): IServerSideDatasource {
    const http = this.http;
    const self = this;
    return {
      getRows(params: IServerSideGetRowsParams): void {
        const { startRow = 0 } = params.request;
        const page = Math.floor(startRow / 50) + 1;

        let url = `/api/v1/audit?page=${page}&pageSize=50`;

        if (self.filterAction) {
          url += `&action=${self.filterAction}`;
        }
        if (self.filterResource) {
          url += `&resource=${self.filterResource}`;
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
