import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideFileRouter, requestContextInterceptor } from '@analogjs/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

class SilentRouteErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Suppress Angular router NG04002 (route not found) errors from SSR
    if (error?.code === 4002) return;
    console.error(error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideFileRouter(),
    provideHttpClient(
      withFetch(),
      withInterceptors([requestContextInterceptor])
    ),
    provideClientHydration(),
    provideCharts(withDefaultRegisterables()),
    { provide: ErrorHandler, useClass: SilentRouteErrorHandler },
  ],
};
