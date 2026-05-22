import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock both pages with simple markers so we only test routing wiring.
vi.mock('@/pages/JournalFinder', () => ({
  default: () => <div data-testid="journal-finder-page">JournalFinder</div>,
}));
vi.mock('@/pages/BrowseJournals', () => ({
  default: () => <div data-testid="browse-journals-page">BrowseJournals</div>,
}));

import App from '@/App';

describe('App routing (smoke)', () => {
  it('renders without crashing and shows the default route', () => {
    render(<App />);
    expect(screen.getByTestId('journal-finder-page')).toBeInTheDocument();
  });
});
