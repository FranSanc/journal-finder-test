import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageNotFound from '@/lib/PageNotFound';
import { renderWithRouter } from '../test-utils.jsx';

describe('PageNotFound', () => {
  it('renders the 404 heading and the requested path', () => {
    renderWithRouter(<PageNotFound />, { route: '/missing-page' });

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByText(/missing-page/)).toBeInTheDocument();
  });

  it('navigates home when the Go Home button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<PageNotFound />, { route: '/whatever' });

    // jsdom doesn't allow redefining location.href; replace location with a stub.
    const originalLocation = window.location;
    const stub = { href: '/whatever' };
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: stub,
    });

    try {
      await user.click(screen.getByRole('button', { name: /go home/i }));
      expect(stub.href).toBe('/');
    } finally {
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: originalLocation,
      });
    }
  });
});
