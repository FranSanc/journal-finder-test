import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, makeJournal } from '../test-utils.jsx';

vi.mock('@/entities/Journal', () => ({
  Journal: { list: vi.fn() },
}));

vi.mock('@/integrations/keywordMatcher', () => ({
  InvokeLLM: vi.fn(),
}));

import { Journal } from '@/entities/Journal';
import { InvokeLLM } from '@/integrations/keywordMatcher';
import JournalFinder from '@/pages/JournalFinder';

describe('JournalFinder page', () => {
  beforeEach(() => {
    Journal.list.mockResolvedValue([
      makeJournal({ id: 'a', title: 'Frontiers in Neuroscience' }),
      makeJournal({ id: 'b', title: 'Frontiers in Medicine', field: 'medicine' }),
    ]);
    InvokeLLM.mockReset();
    localStorage.clear();
  });

  it('loads journals on mount and renders the search tab', async () => {
    renderWithRouter(<JournalFinder />);

    await waitFor(() => expect(Journal.list).toHaveBeenCalled());

    expect(screen.getByText(/frontiers journal finder/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /results \(0\)/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /saved \(0\)/i })).toBeInTheDocument();
  });

  it('runs a search via InvokeLLM and renders matching journals', async () => {
    InvokeLLM.mockResolvedValueOnce({
      matches: [
        {
          journal_title: 'Frontiers in Neuroscience',
          matching_score: 88,
          relevance_explanation: 'Great fit',
          key_matches: ['neuroscience'],
          submission_recommendation: 'Original Research',
        },
        {
          journal_title: 'Nonexistent Journal',
          matching_score: 60,
          relevance_explanation: '',
          key_matches: [],
          submission_recommendation: '',
        },
      ],
    });

    const user = userEvent.setup();
    renderWithRouter(<JournalFinder />);

    await waitFor(() => expect(Journal.list).toHaveBeenCalled());

    await user.type(
      screen.getByLabelText(/research abstract/i),
      'We study cognition.',
    );
    await user.click(screen.getByRole('button', { name: /find your journal/i }));

    await waitFor(() => expect(InvokeLLM).toHaveBeenCalled());

    // Only the existing journal should appear (the unknown one is filtered out).
    expect(await screen.findByText('Frontiers in Neuroscience')).toBeInTheDocument();
    expect(screen.queryByText('Nonexistent Journal')).not.toBeInTheDocument();
    expect(screen.getByText(/found 1 matching journals/i)).toBeInTheDocument();
  });

  it('does nothing when search is triggered with empty fields', async () => {
    renderWithRouter(<JournalFinder />);
    await waitFor(() => expect(Journal.list).toHaveBeenCalled());

    const button = screen.getByRole('button', { name: /find your journal/i });
    expect(button).toBeDisabled();
    expect(InvokeLLM).not.toHaveBeenCalled();
  });

  it('handles LLM errors gracefully without crashing', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    InvokeLLM.mockRejectedValueOnce(new Error('boom'));

    const user = userEvent.setup();
    renderWithRouter(<JournalFinder />);
    await waitFor(() => expect(Journal.list).toHaveBeenCalled());

    await user.type(
      screen.getByLabelText(/research abstract/i),
      'topic',
    );
    await user.click(screen.getByRole('button', { name: /find your journal/i }));

    await waitFor(() => expect(InvokeLLM).toHaveBeenCalled());
    await waitFor(() => expect(errorSpy).toHaveBeenCalled());

    // Results tab still renders empty state without throwing.
    expect(await screen.findByText(/no matches found/i)).toBeInTheDocument();
  });

  it('saves a search to localStorage and surfaces it on the Saved tab', async () => {
    InvokeLLM.mockResolvedValueOnce({
      matches: [
        {
          journal_title: 'Frontiers in Neuroscience',
          matching_score: 80,
          relevance_explanation: 'ok',
          key_matches: [],
          submission_recommendation: '',
        },
      ],
    });

    const user = userEvent.setup();
    renderWithRouter(<JournalFinder />);
    await waitFor(() => expect(Journal.list).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/research abstract/i), 'topic');
    await user.click(screen.getByRole('button', { name: /find your journal/i }));

    await screen.findByText(/found 1 matching journals/i);

    await user.click(screen.getByRole('button', { name: /save search/i }));
    await user.type(screen.getByLabelText(/search name/i), 'My research');
    await user.click(screen.getByRole('button', { name: /^save search$/i }));

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem('frontiers_saved_searches') ?? '[]',
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('My research');
    });

    expect(
      await screen.findByRole('tab', { name: /saved \(1\)/i }),
    ).toBeInTheDocument();
  });

  it('loads previously saved searches from localStorage and can run them', async () => {
    const fixture = [
      {
        id: '99',
        name: 'Previously saved',
        abstract: 'stored abstract',
        keywords: '',
        aims: '',
        scope: '',
        mode: 'abstract',
        results: [
          {
            journal_title: 'Frontiers in Neuroscience',
            matching_score: 90,
            relevance_explanation: 'pre-saved',
            key_matches: [],
            submission_recommendation: '',
            journal_data: { id: 'a', title: 'Frontiers in Neuroscience' },
          },
        ],
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem('frontiers_saved_searches', JSON.stringify(fixture));

    const user = userEvent.setup();
    renderWithRouter(<JournalFinder />);
    await waitFor(() => expect(Journal.list).toHaveBeenCalled());

    await user.click(await screen.findByRole('tab', { name: /saved \(1\)/i }));
    expect(screen.getByText('Previously saved')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /display results/i }));

    // Now on the Results tab, with the pre-saved result rendered.
    expect(await screen.findByText('Frontiers in Neuroscience')).toBeInTheDocument();
    expect(screen.getByText(/pre-saved/i)).toBeInTheDocument();
  });

  it('deletes a saved search via the trash button', async () => {
    const fixture = [
      {
        id: '42',
        name: 'To remove',
        abstract: 'gone',
        keywords: '',
        aims: '',
        scope: '',
        mode: 'abstract',
        results: [],
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem('frontiers_saved_searches', JSON.stringify(fixture));

    const user = userEvent.setup();
    renderWithRouter(<JournalFinder />);
    await waitFor(() => expect(Journal.list).toHaveBeenCalled());

    await user.click(await screen.findByRole('tab', { name: /saved \(1\)/i }));

    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons.find(
      (b) =>
        !/display results/i.test(b.textContent ?? '') &&
        b.closest('.text-destructive, .hover\\:text-destructive') !== null,
    ) || buttons.filter((b) => !/display results/i.test(b.textContent ?? '')).pop();

    await user.click(deleteButton);

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('frontiers_saved_searches'))).toEqual([]);
    });
  });
});
