import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveSearchDialog } from '@/components/finder/SaveSearchDialog';

describe('SaveSearchDialog', () => {
  it('does not render anything when closed', () => {
    render(<SaveSearchDialog isOpen={false} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('renders dialog content when open', () => {
    render(<SaveSearchDialog isOpen onSave={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /save this search/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/search name/i)).toBeInTheDocument();
  });

  it('disables Save until the user enters a name', async () => {
    const user = userEvent.setup();
    render(<SaveSearchDialog isOpen onSave={vi.fn()} onCancel={vi.fn()} />);

    const saveButton = screen.getByRole('button', { name: /save search/i });
    expect(saveButton).toBeDisabled();

    await user.type(screen.getByLabelText(/search name/i), 'My research');
    expect(saveButton).toBeEnabled();
  });

  it('calls onSave with the trimmed name', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<SaveSearchDialog isOpen onSave={onSave} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/search name/i), '   My Search   ');
    await user.click(screen.getByRole('button', { name: /save search/i }));

    expect(onSave).toHaveBeenCalledWith('My Search');
  });

  it('submits when Enter is pressed inside the input', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<SaveSearchDialog isOpen onSave={onSave} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/search name/i), 'Quick{enter}');
    expect(onSave).toHaveBeenCalledWith('Quick');
  });

  it('calls onCancel when the Cancel button is pressed', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<SaveSearchDialog isOpen onSave={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
