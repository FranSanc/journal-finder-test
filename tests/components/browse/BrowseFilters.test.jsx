import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrowseFilters from '@/components/browse/BrowseFilters';

const baseProps = () => ({
  searchTerm: '',
  setSearchTerm: vi.fn(),
  selectedField: 'all',
  setSelectedField: vi.fn(),
  sortBy: 'title',
  setSortBy: vi.fn(),
  fields: ['biology', 'medicine'],
  journalCount: 2,
});

describe('BrowseFilters', () => {
  it('renders the search input and counter', () => {
    render(<BrowseFilters {...baseProps()} />);
    expect(
      screen.getByPlaceholderText(/search journals, keywords/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/showing 2 journals/i)).toBeInTheDocument();
  });

  it('uses singular wording for one journal', () => {
    const props = { ...baseProps(), journalCount: 1 };
    render(<BrowseFilters {...props} />);
    expect(screen.getByText(/showing 1 journal\b/i)).toBeInTheDocument();
  });

  it('mentions the selected field in the counter when not "all"', () => {
    const props = { ...baseProps(), selectedField: 'plant_science' };
    render(<BrowseFilters {...props} />);
    expect(screen.getByText(/in plant science/i)).toBeInTheDocument();
  });

  it('forwards typing to setSearchTerm', async () => {
    const props = baseProps();
    const user = userEvent.setup();
    render(<BrowseFilters {...props} />);

    await user.type(screen.getByPlaceholderText(/search journals/i), 'a');
    expect(props.setSearchTerm).toHaveBeenCalledWith('a');
  });
});
