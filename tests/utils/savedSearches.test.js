import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SavedSearchesService } from '@/utils/savedSearches';

const STORAGE_KEY = 'frontiers_saved_searches';

// Helper: save multiple searches with guaranteed unique IDs by ticking the clock.
const saveAll = (...payloads) => {
  return payloads.map((p) => {
    const result = SavedSearchesService.save(p);
    vi.advanceTimersByTime(1);
    return result;
  });
};

describe('SavedSearchesService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getAll', () => {
    it('returns an empty array when nothing is saved', () => {
      expect(SavedSearchesService.getAll()).toEqual([]);
    });

    it('returns parsed searches when data exists', () => {
      const fixture = [{ id: '1', name: 'foo' }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fixture));

      expect(SavedSearchesService.getAll()).toEqual(fixture);
    });

    it('returns an empty array and logs when stored JSON is corrupt', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem(STORAGE_KEY, '{not valid json');

      expect(SavedSearchesService.getAll()).toEqual([]);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('stores a new search at the top of the list with all fields', () => {
      const stored = SavedSearchesService.save({
        name: 'ML research',
        abstract: 'abs',
        keywords: 'kw',
        aims: 'a',
        scope: 's',
        mode: 'abstract',
        results: [{ id: 'r1' }],
      });

      expect(stored).toMatchObject({
        name: 'ML research',
        abstract: 'abs',
        keywords: 'kw',
        aims: 'a',
        scope: 's',
        mode: 'abstract',
        results: [{ id: 'r1' }],
      });
      expect(stored.id).toEqual(expect.any(String));
      expect(stored.createdAt).toEqual(expect.any(String));

      const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(persisted).toHaveLength(1);
      expect(persisted[0].id).toBe(stored.id);
    });

    it('falls back to defaults when fields are missing', () => {
      const stored = SavedSearchesService.save({});

      expect(stored.name).toBe('Search 1');
      expect(stored.abstract).toBe('');
      expect(stored.keywords).toBe('');
      expect(stored.aims).toBe('');
      expect(stored.scope).toBe('');
      expect(stored.mode).toBe('abstract');
      expect(stored.results).toEqual([]);
    });

    it('prepends new searches in newest-first order', () => {
      saveAll({ name: 'first' }, { name: 'second' });

      const all = SavedSearchesService.getAll();
      expect(all.map((s) => s.name)).toEqual(['second', 'first']);
    });

    it('returns null and logs when localStorage throws', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });

      expect(SavedSearchesService.save({ name: 'x' })).toBeNull();
      expect(errorSpy).toHaveBeenCalled();
      setItemSpy.mockRestore();
    });
  });

  describe('delete', () => {
    it('removes a search by id and returns true', () => {
      const [a, b] = saveAll({ name: 'a' }, { name: 'b' });

      expect(SavedSearchesService.delete(a.id)).toBe(true);
      expect(SavedSearchesService.getAll().map((s) => s.id)).toEqual([b.id]);
    });

    it('is a no-op when id does not exist', () => {
      SavedSearchesService.save({ name: 'a' });
      expect(SavedSearchesService.delete('nope')).toBe(true);
      expect(SavedSearchesService.getAll()).toHaveLength(1);
    });

    it('returns false when localStorage throws', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('boom');
      });

      expect(SavedSearchesService.delete('id')).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
      setItemSpy.mockRestore();
    });
  });

  describe('getById', () => {
    it('returns the matching search', () => {
      const [a] = saveAll({ name: 'a' }, { name: 'b' });

      expect(SavedSearchesService.getById(a.id)).toMatchObject({ name: 'a' });
    });

    it('returns undefined when not found', () => {
      expect(SavedSearchesService.getById('missing')).toBeUndefined();
    });
  });

  describe('clearAll', () => {
    it('removes the storage entry and returns true', () => {
      SavedSearchesService.save({ name: 'a' });
      expect(SavedSearchesService.clearAll()).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('returns false when localStorage throws', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const removeSpy = vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('boom');
      });

      expect(SavedSearchesService.clearAll()).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
      removeSpy.mockRestore();
    });
  });
});
