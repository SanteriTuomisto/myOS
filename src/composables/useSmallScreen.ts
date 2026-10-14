import { onScopeDispose, ref, type Ref } from 'vue';

/** Below this width myOS switches to mobile mode: full-screen windows, tap to open. */
export const SMALL_SCREEN_QUERY = '(max-width: 767px)';

/** Whether the screen is phone-sized, updated live when it changes (rotation, resizing). */
export function useSmallScreen(): Ref<boolean> {
  const query = typeof window !== 'undefined' ? window.matchMedia?.(SMALL_SCREEN_QUERY) : undefined;
  const isSmall = ref(query?.matches === true);

  const update = (event: MediaQueryListEvent) => {
    isSmall.value = event.matches;
  };
  query?.addEventListener?.('change', update);
  onScopeDispose(() => query?.removeEventListener?.('change', update), true);

  return isSmall;
}
