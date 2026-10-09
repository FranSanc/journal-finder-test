import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchForm from '@/components/finder/SearchForm';

const baseProps = () => ({
  searchData: { title: '', abstract: '', keywords: '', aims: '', scope: '' },
  setSearchData: vi.fn(),
  onSearch: vi.fn(),
  isSearching: false,
  searchMode: 'abstract',
  setSearchMode: vi.fn(),
});

describe('SearchForm', () => {
  it('renders the title and the abstract textarea in abstract mode', () => {
    render(<SearchForm {...baseProps()} />);

    // CardTitle renders as a <div>, so we match by text.
    expect(screen.getByText(/frontiers journal finder/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/manuscript title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/research abstract/i)).toBeInTheDocument();
  });

  it('disables the search button when no abstract is provided', () => {
    render(<SearchForm {...baseProps()} />);

    const button = screen.getByRole('button', { name: /find your journal/i });
    expect(button).toBeDisabled();
  });

  it('enables the search button when abstract has content', () => {
    const props = baseProps();
    props.searchData.abstract = 'Some research abstract';

    render(<SearchForm {...props} />);
    expect(screen.getByRole('button', { name: /find your journal/i })).toBeEnabled();
  });

  it('calls setSearchData when typing into the abstract textarea', async () => {
    const user = userEvent.setup();
    const props = baseProps();
    render(<SearchForm {...props} />);

    await user.type(screen.getByLabelText(/research abstract/i), 'x');

    expect(props.setSearchData).toHaveBeenCalled();
    const updater = props.setSearchData.mock.calls[0][0];
    expect(updater({ abstract: '', keywords: '', aims: '', scope: '' })).toEqual({
      abstract: 'x',
      keywords: '',
      aims: '',
      scope: '',
    });
  });

  it('calls onSearch when the button is clicked', async () => {
    const user = userEvent.setup();
    const props = baseProps();
    props.searchData.abstract = 'abstract';

    render(<SearchForm {...props} />);
    await user.click(screen.getByRole('button', { name: /find your journal/i }));

    expect(props.onSearch).toHaveBeenCalledOnce();
  });

  it('switches to keywords mode and exposes keyword inputs', async () => {
    const user = userEvent.setup();
    const props = baseProps();
    render(<SearchForm {...props} />);

    await user.click(screen.getByRole('button', { name: /search by keywords/i }));

    expect(props.setSearchMode).toHaveBeenCalledWith('keywords');
  });

  it('shows keyword inputs when searchMode is keywords', () => {
    const props = baseProps();
    props.searchMode = 'keywords';

    render(<SearchForm {...props} />);

    expect(screen.getByLabelText(/keywords/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/research aims/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/research scope/i)).toBeInTheDocument();
  });

  it('keeps the search button disabled in keywords mode until any keyword field has content', () => {
    const props = baseProps();
    props.searchMode = 'keywords';

    const { rerender } = render(<SearchForm {...props} />);
    expect(screen.getByRole('button', { name: /find your journal/i })).toBeDisabled();

    rerender(
      <SearchForm
        {...props}
        searchData={{ ...props.searchData, keywords: 'AI' }}
      />,
    );
    expect(screen.getByRole('button', { name: /find your journal/i })).toBeEnabled();
  });

  it('shows the loading state when isSearching is true', () => {
    const props = baseProps();
    props.isSearching = true;
    props.searchData.abstract = 'something';

    render(<SearchForm {...props} />);
    expect(screen.getByRole('button', { name: /analyzing & matching/i })).toBeDisabled();
  });
});
