import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  imports: [AppLayoutComponent, AgGridAngular],
  template: `
    <app-layout>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">Orders</h1>
          <button
            (click)="exportCsv()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Export CSV
          </button>
        </div>
        @if (isBrowser()) {
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
            (cellValueChanged)="onCellValueChanged($event)"
          />
        } @else {
          <div class="h-[75vh] bg-slate-800/50 rounded-xl animate-pulse flex items-center justify-center">
            <p class="text-slate-500">Loading data grid...</p>
          </div>
        }
      </div>
    </app-layout>
  `,
})
export default class OrdersPage implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private gridApi!: GridApi;

  isBrowser = signal(false);

  theme = themeQuartz.withPart(colorSchemeDark);

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: true,
    minWidth: 100,
  };

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', maxWidth: 80, filter: 'agNumberColumnFilter' },
    { field: 'customerName', headerName: 'Customer', filter: 'agTextColumnFilter' },
    {
      field: 'amount',
      headerName: 'Amount',
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => {
        if (params.value == null) return '';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(params.value));
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: StatusCellComponent,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
      filter: 'agSetColumnFilter',
    },
    { field: 'itemsCount', headerName: 'Items', filter: 'agNumberColumnFilter', maxWidth: 100 },
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

  ngOnInit(): void {
    this.isBrowser.set(isPlatformBrowser(this.platformId));
  }

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
      this.http.put(`/api/v1/orders/${id}`, body)
    ).catch((err) => {
      console.error('Failed to update order:', err);
      event.node.setDataValue(field, event.oldValue);
    });
  }

  exportCsv(): void {
    this.gridApi?.exportDataAsCsv({ fileName: 'orders.csv' });
  }

  private createDatasource(): IServerSideDatasource {
    const http = this.http;
    return {
      getRows(params: IServerSideGetRowsParams): void {
        const { startRow = 0, sortModel, filterModel } = params.request;
        const page = Math.floor(startRow / 50) + 1;
        const pageSize = 50;

        let url = `/api/v1/orders?page=${page}&pageSize=${pageSize}`;

        if (sortModel && sortModel.length > 0) {
          url += `&sortField=${sortModel[0].colId}&sortOrder=${sortModel[0].sort}`;
        }

        if (filterModel) {
          const fm = filterModel as Record<string, any>;
          if (fm['status']?.values?.length) {
            url += `&filter_status=${fm['status'].values[0]}`;
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
