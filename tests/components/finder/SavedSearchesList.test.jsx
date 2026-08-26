import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SavedSearchesList from '@/components/finder/SavedSearchesList';

const buildSavedSearches = () => [
  {
    id: '1',
    name: 'Abstract search',
    mode: 'abstract',
    abstract: 'Long abstract about quantum computing.',
    keywords: '',
    aims: '',
    scope: '',
    createdAt: '2025-02-01T10:00:00.000Z',
  },
  {
    id: '2',
    name: 'Keyword search',
    mode: 'keywords',
    abstract: '',
    keywords: 'ML, AI',
    aims: 'Build models',
    scope: 'CS',
    createdAt: '2025-02-02T10:00:00.000Z',
  },
];

describe('SavedSearchesList', () => {
  it('renders the loading indicator when isLoading is true', () => {
    render(
      <SavedSearchesList
        savedSearches={[]}
        onRunSearch={vi.fn()}
        onDeleteSearch={vi.fn()}
        isLoading
      />,
    );

    expect(screen.getByText(/loading saved searches/i)).toBeInTheDocument();
  });

  it('renders the empty state when there are no searches', () => {
    render(
      <SavedSearchesList
        savedSearches={[]}
        onRunSearch={vi.fn()}
        onDeleteSearch={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByText(/no saved searches yet/i)).toBeInTheDocument();
  });

  it('renders each saved search with the right summary', () => {
    render(
      <SavedSearchesList
        savedSearches={buildSavedSearches()}
        onRunSearch={vi.fn()}
        onDeleteSearch={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByText('Abstract search')).toBeInTheDocument();
    expect(screen.getByText(/long abstract about quantum/i)).toBeInTheDocument();

    expect(screen.getByText('Keyword search')).toBeInTheDocument();
    expect(screen.getByText('ML, AI')).toBeInTheDocument();
    expect(screen.getByText('Build models')).toBeInTheDocument();

    expect(screen.getByText('2 searches')).toBeInTheDocument();
  });

  it('invokes onRunSearch with the corresponding saved search', async () => {
    const onRunSearch = vi.fn();
    const user = userEvent.setup();
    const searches = buildSavedSearches();

    render(
      <SavedSearchesList
        savedSearches={searches}
        onRunSearch={onRunSearch}
        onDeleteSearch={vi.fn()}
        isLoading={false}
      />,
    );

    const runButtons = screen.getAllByRole('button', { name: /view results/i });
    await user.click(runButtons[0]);

    expect(onRunSearch).toHaveBeenCalledWith(searches[0]);
  });

  it('invokes onDeleteSearch with the search id', async () => {
    const onDeleteSearch = vi.fn();
    const user = userEvent.setup();
    const searches = buildSavedSearches();

    render(
      <SavedSearchesList
        savedSearches={searches}
        onRunSearch={vi.fn()}
        onDeleteSearch={onDeleteSearch}
        isLoading={false}
      />,
    );

    // Each row has a trash button (icon-only). They're rendered after the "View results" button.
    const allButtons = screen.getAllByRole('button');
    const deleteButtons = allButtons.filter(
      (b) => !/view results/i.test(b.textContent ?? ''),
    );
    await user.click(deleteButtons[0]);

    expect(onDeleteSearch).toHaveBeenCalledWith('1');
  });

  it('uses singular wording when there is exactly one search', () => {
    render(
      <SavedSearchesList
        savedSearches={[buildSavedSearches()[0]]}
        onRunSearch={vi.fn()}
        onDeleteSearch={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByText('1 search')).toBeInTheDocument();
  });
});
