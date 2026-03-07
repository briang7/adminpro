import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

type UIState = {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
};

export const UIStore = signalStore(
  { providedIn: 'root' },
  withState<UIState>({
    sidebarCollapsed: false,
    theme: 'dark',
  }),
  withMethods((store) => ({
    toggleSidebar() {
      patchState(store, { sidebarCollapsed: !store.sidebarCollapsed() });
    },
    setTheme(theme: 'dark' | 'light') {
      patchState(store, { theme });
    },
  }))
);
