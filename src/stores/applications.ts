import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Application, AppType, OpenApplicationInput, Size } from '@/types';

const DEFAULT_WINDOW_SIZE: Size = { width: 500, height: 350 };

/** Phones get maximized windows, since a desktop-size window doesn't fit. */
export function isSmallScreen(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches === true;
}

export const useApplicationsStore = defineStore('applications', () => {
  const nextId = ref(0);
  const applications = ref<Application[]>([]);
  const activeWindowId = ref<number | null>(null);
  // Last size per app type, so a reopened app keeps its size
  const windowSizes = ref<Partial<Record<AppType, Size>>>({});

  function openApplication(input: OpenApplicationInput): Application {
    const app: Application = {
      ...input,
      id: nextId.value,
      minimized: false,
      maximized: isSmallScreen(),
    };
    nextId.value += 1;
    applications.value.push(app);
    activeWindowId.value = app.id;
    return app;
  }

  function updateApplication(id: number, changes: Partial<Omit<Application, 'id'>>) {
    const app = getApplicationById(id);
    if (!app) {
      return;
    }
    Object.assign(app, changes);
    if (changes.size) {
      windowSizes.value[app.type] = { ...changes.size };
    }
  }

  function closeApplication(id: number) {
    applications.value = applications.value.filter((app) => app.id !== id);
    selectOtherActiveWindow();
  }

  function setActiveWindow(id: number | null) {
    activeWindowId.value = id;
    if (id != null) {
      updateApplication(id, { minimized: false });
    }
  }

  function minimizeWindow(id: number) {
    updateApplication(id, { minimized: true });
    selectOtherActiveWindow();
  }

  /** Taskbar click: hides the active window, or brings any other window to the front. */
  function toggleWindow(id: number) {
    const app = getApplicationById(id);
    if (app && activeWindowId.value === id && !app.minimized) {
      minimizeWindow(id);
    } else {
      setActiveWindow(id);
    }
  }

  function selectOtherActiveWindow() {
    const visibleApp = [...applications.value].reverse().find((app) => !app.minimized);
    activeWindowId.value = visibleApp ? visibleApp.id : null;
  }

  function getApplicationById(id: number): Application | undefined {
    return applications.value.find((app) => app.id === id);
  }

  /** Last used size of the app's window, or `defaultSize` if it hasn't been opened yet. */
  function getWindowSize(type: AppType, defaultSize: Size = DEFAULT_WINDOW_SIZE): Size {
    return windowSizes.value[type] ?? defaultSize;
  }

  return {
    nextId,
    applications,
    activeWindowId,
    windowSizes,
    openApplication,
    updateApplication,
    closeApplication,
    setActiveWindow,
    minimizeWindow,
    toggleWindow,
    selectOtherActiveWindow,
    getApplicationById,
    getWindowSize,
  };
}, {
  persist: true,
});
