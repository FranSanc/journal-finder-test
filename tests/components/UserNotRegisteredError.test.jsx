import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

describe('UserNotRegisteredError', () => {
  it('renders the access restricted message', () => {
    render(<UserNotRegisteredError />);
    expect(screen.getByRole('heading', { name: /access restricted/i })).toBeInTheDocument();
    expect(screen.getByText(/not registered to use this application/i)).toBeInTheDocument();
  });

  it('lists the troubleshooting steps', () => {
    render(<UserNotRegisteredError />);
    expect(screen.getByText(/verify you are logged in/i)).toBeInTheDocument();
    expect(
      screen.getByText(/contact the app administrator for access/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/try logging out and back in/i)).toBeInTheDocument();
  });
});
