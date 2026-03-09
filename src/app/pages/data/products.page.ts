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
          <h1 class="text-2xl font-bold">Products</h1>
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
export default class ProductsPage implements OnInit {
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
    { field: 'name', headerName: 'Name', editable: true, filter: 'agTextColumnFilter' },
    { field: 'sku', headerName: 'SKU', filter: 'agTextColumnFilter', maxWidth: 120 },
    {
      field: 'category',
      headerName: 'Category',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['Electronics', 'Clothing', 'Food', 'Home', 'Sports', 'Books', 'Toys'] },
      filter: 'agSetColumnFilter',
    },
    {
      field: 'price',
      headerName: 'Price',
      editable: true,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => {
        if (params.value == null) return '';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(params.value));
      },
    },
    {
      field: 'stock',
      headerName: 'Stock',
      editable: true,
      filter: 'agNumberColumnFilter',
      maxWidth: 100,
      cellStyle: (params) => {
        if (params.value != null && Number(params.value) < 10) {
          return { color: '#ef4444' };
        }
        return null;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: StatusCellComponent,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['active', 'discontinued', 'out_of_stock'] },
      filter: 'agSetColumnFilter',
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
      this.http.put(`/api/v1/products/${id}`, body)
    ).catch((err) => {
      console.error('Failed to update product:', err);
      event.node.setDataValue(field, event.oldValue);
    });
  }

  exportCsv(): void {
    this.gridApi?.exportDataAsCsv({ fileName: 'products.csv' });
  }

  private createDatasource(): IServerSideDatasource {
    const http = this.http;
    return {
      getRows(params: IServerSideGetRowsParams): void {
        const { startRow = 0, sortModel, filterModel } = params.request;
        const page = Math.floor(startRow / 50) + 1;
        const pageSize = 50;

        let url = `/api/v1/products?page=${page}&pageSize=${pageSize}`;

        if (sortModel && sortModel.length > 0) {
          url += `&sortField=${sortModel[0].colId}&sortOrder=${sortModel[0].sort}`;
        }

        if (filterModel) {
          const fm = filterModel as Record<string, any>;
          if (fm['category']?.values?.length) {
            url += `&filter_category=${encodeURIComponent(fm['category'].values[0])}`;
          }
          if (fm['status']?.values?.length) {
            url += `&filter_status=${fm['status'].values[0]}`;
          }
          if (fm['name']?.filter) {
            url += `&search=${encodeURIComponent(fm['name'].filter)}`;
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
