import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';

describe('queryClientInstance', () => {
  it('is a QueryClient instance', () => {
    expect(queryClientInstance).toBeInstanceOf(QueryClient);
  });

  it('disables refetchOnWindowFocus and retries once', () => {
    const defaults = queryClientInstance.getDefaultOptions();
    expect(defaults.queries.refetchOnWindowFocus).toBe(false);
    expect(defaults.queries.retry).toBe(1);
  });
});
