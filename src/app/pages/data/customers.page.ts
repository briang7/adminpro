import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridReadyEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  CellValueChangedEvent,
  GridApi,
  themeQuartz,
  colorSchemeDark,
} from 'ag-grid-community';
import { AppLayoutComponent } from '../../components/layout/app-layout.component';
import { StatusCellComponent } from '../../components/data-grid/status-cell.component';
import { RouteMeta } from '@analogjs/router';
import { authGuard } from '../../guards/auth.guard';
import { firstValueFrom } from 'rxjs';

export const routeMeta: RouteMeta = {
  canActivate: [authGuard],
};

@Component({
  standalone: true,
  imports: [AppLayoutComponent, AgGridAngular],
  template: `
    <app-layout>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">Customers</h1>
          <button
            (click)="exportCsv()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Export CSV
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
          [rowSelection]="rowSelection"
          (gridReady)="onGridReady($event)"
          (cellValueChanged)="onCellValueChanged($event)"
        />
      </div>
    </app-layout>
  `,
})
export default class CustomersPage {
  private http = inject(HttpClient);
  private gridApi!: GridApi;

  theme = themeQuartz.withPart(colorSchemeDark);

  rowSelection: any = { mode: 'multiRow', checkboxes: true };

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: true,
    minWidth: 100,
  };

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', maxWidth: 80, filter: 'agNumberColumnFilter' },
    { field: 'company', headerName: 'Company', editable: true, filter: 'agTextColumnFilter' },
    { field: 'contactName', headerName: 'Contact', editable: true, filter: 'agTextColumnFilter' },
    { field: 'email', headerName: 'Email', filter: 'agTextColumnFilter' },
    { field: 'phone', headerName: 'Phone', filter: false },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: StatusCellComponent,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['active', 'inactive', 'prospect', 'churned'] },
      filter: 'agSetColumnFilter',
    },
    {
      field: 'tier',
      headerName: 'Tier',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['free', 'starter', 'professional', 'enterprise'] },
      filter: 'agSetColumnFilter',
    },
    {
      field: 'revenue',
      headerName: 'Revenue',
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => {
        if (params.value == null) return '';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(params.value));
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
  ];

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    const datasource = this.createDatasource();
    event.api.setGridOption('serverSideDatasource', datasource);
  }

  onCellValueChanged(event: CellValueChangedEvent): void {
    const { id } = event.data;
    const field = event.colDef.field!;
    const body = { [field]: event.newValue };

    firstValueFrom(
      this.http.put(`/api/v1/customers/${id}`, body)
    ).catch((err) => {
      console.error('Failed to update customer:', err);
      // Revert the cell value on failure
      event.node.setDataValue(field, event.oldValue);
    });
  }

  exportCsv(): void {
    this.gridApi?.exportDataAsCsv({ fileName: 'customers.csv' });
  }

  private createDatasource(): IServerSideDatasource {
    const http = this.http;
    return {
      getRows(params: IServerSideGetRowsParams): void {
        const { startRow = 0, sortModel, filterModel } = params.request;
        const page = Math.floor(startRow / 50) + 1;
        const pageSize = 50;

        let url = `/api/v1/customers?page=${page}&pageSize=${pageSize}`;

        if (sortModel && sortModel.length > 0) {
          url += `&sortField=${sortModel[0].colId}&sortOrder=${sortModel[0].sort}`;
        }

        if (filterModel) {
          const fm = filterModel as Record<string, any>;
          if (fm['status']?.values?.length) {
            url += `&filter_status=${fm['status'].values[0]}`;
          }
          if (fm['tier']?.values?.length) {
            url += `&filter_tier=${fm['tier'].values[0]}`;
          }
          if (fm['company']?.filter) {
            url += `&search=${encodeURIComponent(fm['company'].filter)}`;
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
