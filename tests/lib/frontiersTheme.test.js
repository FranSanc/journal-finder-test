import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@frontiers/prime-preset', () => ({ default: { name: 'frontiers' } }));

vi.mock('@primeuix/themes', () => ({
  useTheme: vi.fn(),
  Theme: {
    getCommon: () => ({
      primitive: { css: ':root{--p-primary-color:#003bde}' },
      semantic: { css: '' },
      global: { css: '' },
      style: '',
    }),
    getPreset: () => ({ components: { button: {} } }),
    getComponent: () => ({ css: '.p-button{border-radius:3rem}', style: '' }),
  },
}));

import { applyFrontiersPrimePreset } from '@/lib/frontiersTheme';

describe('applyFrontiersPrimePreset', () => {
  afterEach(() => {
    document.getElementById('frontiers-prime-preset')?.remove();
  });

  it('injects preset CSS into a style tag', () => {
    applyFrontiersPrimePreset();

    const el = document.getElementById('frontiers-prime-preset');
    expect(el).toBeTruthy();
    expect(el.tagName).toBe('STYLE');
    expect(el.textContent).toContain('--p-primary-color');
    expect(el.textContent).toContain('.p-button');
  });

  it('reuses the existing style tag on subsequent calls', () => {
    applyFrontiersPrimePreset();
    applyFrontiersPrimePreset();

    expect(document.querySelectorAll('#frontiers-prime-preset')).toHaveLength(1);
  });
});
