import { describe, it, expect } from 'vitest';
import { createPageUrl } from '@/utils';

describe('createPageUrl', () => {
  it('prefixes a single-word page name with a slash', () => {
    expect(createPageUrl('JournalFinder')).toBe('/JournalFinder');
  });

  it('replaces spaces with dashes', () => {
    expect(createPageUrl('Browse Journals')).toBe('/Browse-Journals');
  });

  it('handles multiple consecutive spaces', () => {
    expect(createPageUrl('A B C')).toBe('/A-B-C');
  });

  it('returns just a slash for an empty string', () => {
    expect(createPageUrl('')).toBe('/');
  });
});
