import { describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { useSmallScreen } from '@/composables/useSmallScreen';
import { stubSmallScreen } from '../utils';

describe('useSmallScreen', () => {
  it('is true on a phone-sized screen and false on a wide one', () => {
    stubSmallScreen(true);
    expect(useSmallScreen().value).toBe(true);

    stubSmallScreen(false);
    expect(useSmallScreen().value).toBe(false);
  });

  it('follows changes live, e.g. rotating a phone', () => {
    const setSmall = stubSmallScreen(false);
    const scope = effectScope();
    const isSmall = scope.run(() => useSmallScreen())!;

    setSmall(true);
    expect(isSmall.value).toBe(true);

    scope.stop();
    setSmall(false);
    expect(isSmall.value).toBe(true);
  });

  it('is false where matchMedia does not exist', () => {
    vi.stubGlobal('matchMedia', undefined);

    expect(useSmallScreen().value).toBe(false);
  });
});
