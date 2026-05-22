import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultsGrid from '@/components/finder/ResultsGrid';
import { makeMatch } from '../../test-utils.jsx';

describe('ResultsGrid', () => {
  it('renders a loading state while searching', () => {
    render(
      <ResultsGrid
        results={[]}
        isSearching
        onBackToSearch={vi.fn()}
        onSaveSearch={vi.fn()}
      />,
    );

    expect(screen.getByText(/analyzing your research/i)).toBeInTheDocument();
  });

  it('renders the empty state when there are no results', async () => {
    const onBackToSearch = vi.fn();
    const user = userEvent.setup();

    render(
      <ResultsGrid
        results={[]}
        isSearching={false}
        onBackToSearch={onBackToSearch}
        onSaveSearch={vi.fn()}
      />,
    );

    expect(screen.getByText(/no matches found/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try another search/i }));
    expect(onBackToSearch).toHaveBeenCalledOnce();
  });

  it('renders journal cards for each result and the header count', () => {
    const results = [
      makeMatch({ journal_data: { ...makeMatch().journal_data, id: '1', title: 'Journal A' } }),
      makeMatch({ journal_data: { ...makeMatch().journal_data, id: '2', title: 'Journal B' } }),
    ];

    render(
      <ResultsGrid
        results={results}
        isSearching={false}
        onBackToSearch={vi.fn()}
        onSaveSearch={vi.fn()}
      />,
    );

    expect(screen.getByText(/found 2 matching journals/i)).toBeInTheDocument();
    expect(screen.getByText('Journal A')).toBeInTheDocument();
    expect(screen.getByText('Journal B')).toBeInTheDocument();
  });

  it('invokes onSaveSearch and onBackToSearch via header buttons', async () => {
    const onBackToSearch = vi.fn();
    const onSaveSearch = vi.fn();
    const user = userEvent.setup();

    render(
      <ResultsGrid
        results={[makeMatch()]}
        isSearching={false}
        onBackToSearch={onBackToSearch}
        onSaveSearch={onSaveSearch}
      />,
    );

    await user.click(screen.getByRole('button', { name: /save search/i }));
    expect(onSaveSearch).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: /new search/i }));
    expect(onBackToSearch).toHaveBeenCalledOnce();
  });

  it('hides the save search button when onSaveSearch is not provided', () => {
    render(
      <ResultsGrid
        results={[makeMatch()]}
        isSearching={false}
        onBackToSearch={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: /save search/i })).not.toBeInTheDocument();
  });
});
