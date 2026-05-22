import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, makeJournal } from '../test-utils.jsx';

vi.mock('@/entities/Journal', () => ({
  Journal: { list: vi.fn() },
}));

import { Journal } from '@/entities/Journal';
import BrowseJournals from '@/pages/BrowseJournals';

describe('BrowseJournals page', () => {
  beforeEach(() => {
    Journal.list.mockResolvedValue([
      makeJournal({ id: '1', title: 'Frontiers in Neuroscience', field: 'biology' }),
      makeJournal({
        id: '2',
        title: 'Frontiers in Medicine',
        field: 'medicine',
        keywords: ['clinical'],
      }),
      makeJournal({
        id: '3',
        title: 'Aquatic Sciences',
        field: 'biology',
        keywords: ['ocean'],
      }),
    ]);
  });

  it('renders all journals after load', async () => {
    renderWithRouter(<BrowseJournals />);

    expect(await screen.findByText('Frontiers in Neuroscience')).toBeInTheDocument();
    expect(screen.getByText('Frontiers in Medicine')).toBeInTheDocument();
    expect(screen.getByText('Aquatic Sciences')).toBeInTheDocument();
  });

  it('shows the total count in the heading', async () => {
    renderWithRouter(<BrowseJournals />);
    await waitFor(() => expect(Journal.list).toHaveBeenCalled());
    expect(
      await screen.findByText(/explore our comprehensive collection of 3/i),
    ).toBeInTheDocument();
  });

  it('filters journals by free-text search', async () => {
    const user = userEvent.setup();
    renderWithRouter(<BrowseJournals />);

    await screen.findByText('Frontiers in Neuroscience');

    await user.type(
      screen.getByPlaceholderText(/search journals/i),
      'aquatic',
    );

    await waitFor(() =>
      expect(screen.queryByText('Frontiers in Neuroscience')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Aquatic Sciences')).toBeInTheDocument();
  });

  it('shows an empty state when no journals match', async () => {
    const user = userEvent.setup();
    renderWithRouter(<BrowseJournals />);

    await screen.findByText('Frontiers in Neuroscience');

    await user.type(
      screen.getByPlaceholderText(/search journals/i),
      'nothingmatches',
    );

    expect(
      await screen.findByText(/no journals found matching your criteria/i),
    ).toBeInTheDocument();
  });
});
