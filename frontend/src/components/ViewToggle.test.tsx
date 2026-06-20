import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ViewToggle } from './ViewToggle';

describe('ViewToggle', () => {
  it('marks the active view with aria-pressed', () => {
    render(<ViewToggle value="table" onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: /table/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /cards/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('calls onChange when either view is selected', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ViewToggle value="cards" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /table/i }));
    await user.click(screen.getByRole('button', { name: /cards/i }));

    expect(onChange).toHaveBeenNthCalledWith(1, 'table');
    expect(onChange).toHaveBeenNthCalledWith(2, 'cards');
  });
});
