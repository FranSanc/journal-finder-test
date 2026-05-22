import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Journal } from '@/entities/Journal';

const CSV_FIXTURE = `Journal Name,Abbreviation,Subject Area,Scope,Keywords,Impact Factor,Submission Types,Open Access,URL,ISSN (Print),ISSN (Electronic),Description
Frontiers in Neuroscience,Front. Neurosci.,Life Sciences,Brain & nervous system,neuroscience; brain; cognition,4.5,Original Research; Review,Yes,https://frontiers/neuro,1234-5678,8765-4321,A neuroscience journal
Frontiers in Medicine,Front. Med.,Medicine & Health,Medical research,medicine; clinical,5.1,Original Research,Yes,https://frontiers/med,,9999-0000,A medical journal
Frontiers in Engineering,,Engineering & Technology,Engineering,,,,No,,,,
Frontiers in Unknown,,Unmapped Area,Other,,,,,,,,`;

describe('Journal.list', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses CSV rows into journal objects', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(CSV_FIXTURE),
    });

    const journals = await Journal.list();

    expect(globalThis.fetch).toHaveBeenCalledWith('/JournalList.csv');
    expect(journals).toHaveLength(4);

    expect(journals[0]).toEqual({
      title: 'Frontiers in Neuroscience',
      short_title: 'Front. Neurosci.',
      field: 'biology',
      scope: 'Brain & nervous system',
      keywords: ['neuroscience', 'brain', 'cognition'],
      impact_factor: 4.5,
      submission_types: ['Original Research', 'Review'],
      open_access: true,
      website_url: 'https://frontiers/neuro',
      issn_print: '1234-5678',
      issn_electronic: '8765-4321',
      description: 'A neuroscience journal',
    });
  });

  it('maps subject areas to internal field enums', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(CSV_FIXTURE),
    });

    const journals = await Journal.list();
    expect(journals.map((j) => j.field)).toEqual([
      'biology',
      'medicine',
      'engineering',
      'other',
    ]);
  });

  it('handles missing/empty optional columns gracefully', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(CSV_FIXTURE),
    });

    const journals = await Journal.list();
    const engineering = journals[2];

    expect(engineering.keywords).toEqual([]);
    expect(engineering.submission_types).toEqual([]);
    expect(engineering.impact_factor).toBeNull();
    expect(engineering.open_access).toBe(false);
  });

  it('returns an empty array and logs when fetch responds non-ok', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve(''),
    });

    const journals = await Journal.list();
    expect(journals).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('returns an empty array and logs when fetch throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.fetch.mockRejectedValueOnce(new Error('network'));

    const journals = await Journal.list();
    expect(journals).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });
});
