import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import JournalCard from '@/components/finder/JournalCard';
import { makeJournal, makeMatch } from '../../test-utils.jsx';

describe('JournalCard', () => {
  it('renders core journal information', () => {
    render(<JournalCard journal={{ journal_data: makeJournal() }} />);

    // CardTitle renders as a div, so look up by text rather than role.
    expect(screen.getByText('Frontiers in Neuroscience')).toBeInTheDocument();
    expect(screen.getByText('Front. Neurosci.')).toBeInTheDocument();
    expect(screen.getByText(/leading neuroscience journal/i)).toBeInTheDocument();
    expect(screen.getByText(/JIF: 4.5/)).toBeInTheDocument();
    expect(screen.getByText(/2 article types/)).toBeInTheDocument();
    expect(screen.getByText(/ISSN: 1234-5678/)).toBeInTheDocument();
  });

  it('renders the website link when website_url is provided', () => {
    render(<JournalCard journal={{ journal_data: makeJournal() }} />);

    const link = screen.getByRole('link', { name: /visit journal website/i });
    expect(link).toHaveAttribute('href', 'https://example.com/journal');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('falls back to a frontiers URL when website_url is missing', () => {
    render(
      <JournalCard
        journal={{ journal_data: makeJournal({ website_url: null }) }}
      />,
    );

    expect(
      screen.getByRole('link', { name: /visit journal website/i }),
    ).toHaveAttribute('href', 'https://www.frontiersin.org/journals/biology');
  });

  it('shows score, rank and explanation when showScore is true', () => {
    render(<JournalCard journal={makeMatch()} showScore rank={1} />);

    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // rank badge
    expect(screen.getByText(/why this journal matches/i)).toBeInTheDocument();
    expect(screen.getByText(/strong topical overlap/i)).toBeInTheDocument();
  });

  it('renders key match badges and truncates beyond four', () => {
    render(
      <JournalCard
        journal={makeMatch({
          key_matches: ['a', 'b', 'c', 'd', 'e', 'f'],
        })}
        showScore
      />,
    );

    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('d')).toBeInTheDocument();
    expect(screen.queryByText('e')).not.toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('omits the score block when matching_score is null', () => {
    render(
      <JournalCard
        journal={makeMatch({ matching_score: null })}
        showScore
      />,
    );

    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('renders keyword badges and truncates beyond six', () => {
    render(
      <JournalCard
        journal={{
          journal_data: makeJournal({
            keywords: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8'],
          }),
        }}
      />,
    );

    expect(screen.getByText('k1')).toBeInTheDocument();
    expect(screen.getByText('k6')).toBeInTheDocument();
    expect(screen.queryByText('k7')).not.toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });
});
