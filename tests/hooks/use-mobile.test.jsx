import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

const makeMatchMedia = (initialMatches) => {
  const listeners = new Set();
  const mql = {
    matches: initialMatches,
    media: '',
    onchange: null,
    addEventListener: (_event, cb) => listeners.add(cb),
    removeEventListener: (_event, cb) => listeners.delete(cb),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    _fire: () => listeners.forEach((cb) => cb()),
  };
  return mql;
};

describe('useIsMobile', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1024,
    });
  });

  it('returns false for desktop widths', () => {
    window.matchMedia = vi.fn().mockReturnValue(makeMatchMedia(false));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true for mobile widths', () => {
    window.innerWidth = 500;
    window.matchMedia = vi.fn().mockReturnValue(makeMatchMedia(true));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('updates when the matchMedia listener fires', () => {
    const mql = makeMatchMedia(false);
    window.matchMedia = vi.fn().mockReturnValue(mql);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 400;
      mql._fire();
    });

    expect(result.current).toBe(true);
  });
});
