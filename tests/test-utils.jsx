import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';

/**
 * Render a component inside a MemoryRouter so any react-router hooks work in tests.
 * @param {React.ReactElement} ui
 * @param {{ route?: string }} options
 */
export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <PrimeReactProvider value={{ ripple: false }}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </PrimeReactProvider>,
  );
}

/** A minimal mock journal that satisfies the JournalCard / pages shape. */
export function makeJournal(overrides = {}) {
  return {
    id: 'jrnl-1',
    title: 'Frontiers in Neuroscience',
    short_title: 'Front. Neurosci.',
    field: 'biology',
    scope: 'Brain & nervous system research',
    keywords: ['neuroscience', 'brain'],
    impact_factor: 4.5,
    submission_types: ['Original Research', 'Review'],
    open_access: true,
    website_url: 'https://example.com/journal',
    issn_print: '1234-5678',
    issn_electronic: '8765-4321',
    description: 'A leading neuroscience journal.',
    ...overrides,
  };
}

/** A match result as produced by the JournalFinder page. */
export function makeMatch(overrides = {}) {
  return {
    journal_title: 'Frontiers in Neuroscience',
    matching_score: 92,
    relevance_explanation: 'Strong topical overlap with submitted abstract.',
    key_matches: ['neuroscience', 'cognition'],
    submission_recommendation: 'Submit as Original Research',
    journal_data: makeJournal(),
    ...overrides,
  };
}
