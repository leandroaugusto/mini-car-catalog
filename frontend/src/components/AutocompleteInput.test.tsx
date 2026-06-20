import { StrictMode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AutocompleteInput } from './AutocompleteInput';

describe('AutocompleteInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('waits before requesting suggestions', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const fetchSuggestions = jest.fn().mockResolvedValue(['Ford']);

    render(
      <AutocompleteInput
        id="carBrand"
        name="carBrand"
        label="Car Brand"
        value=""
        onChange={jest.fn()}
        onBlur={jest.fn()}
        fetchSuggestions={fetchSuggestions}
      />
    );

    await user.type(screen.getByRole('textbox', { name: /car brand/i }), 'Fo');

    expect(fetchSuggestions).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(fetchSuggestions).toHaveBeenCalledWith('Fo');
    });
  });

  it('ignores stale responses from older requests', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const fetchSuggestions = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<string[]>((resolve) => {
            setTimeout(() => resolve(['Ford']), 50);
          })
      )
      .mockResolvedValueOnce(['Ferrari']);

    render(
      <AutocompleteInput
        id="carBrand"
        name="carBrand"
        label="Car Brand"
        value=""
        onChange={jest.fn()}
        onBlur={jest.fn()}
        fetchSuggestions={fetchSuggestions}
      />
    );

    const input = screen.getByRole('textbox', { name: /car brand/i });

    await user.type(input, 'Fo');
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await user.clear(input);
    await user.type(input, 'Fe');
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    await waitFor(() => {
      expect(screen.getByText('Ferrari')).toBeInTheDocument();
    });

    expect(screen.queryByText('Ford')).not.toBeInTheDocument();
  });

  it('closes the suggestions after selecting a value', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onChange = jest.fn();
    const fetchSuggestions = jest.fn().mockResolvedValue(['1990']);

    render(
      <AutocompleteInput
        id="carYear"
        name="carYear"
        label="Car Year"
        value=""
        onChange={onChange}
        onBlur={jest.fn()}
        fetchSuggestions={fetchSuggestions}
        minQueryLength={1}
      />
    );

    await user.type(screen.getByRole('textbox', { name: /car year/i }), '199');

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    const option = await screen.findByRole('button', { name: '1990' });
    expect(option).toBeInTheDocument();

    await user.click(option);

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenLastCalledWith('1990');
    expect(
      screen.queryByRole('list', { name: /car year suggestions/i })
    ).not.toBeInTheDocument();
  });

  it('shows a clear action for typed values', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onChange = jest.fn();

    render(
      <AutocompleteInput
        id="miniBrand"
        name="miniBrand"
        label="Mini Brand"
        value=""
        onChange={onChange}
        onBlur={jest.fn()}
        fetchSuggestions={jest.fn().mockResolvedValue([])}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /mini brand/i }),
      'Hot Wheels'
    );

    await user.click(screen.getByRole('button', { name: /clear mini brand/i }));

    expect(onChange).toHaveBeenLastCalledWith('');
    expect(screen.getByRole('textbox', { name: /mini brand/i })).toHaveValue(
      ''
    );
  });

  it('does not fetch suggestions on mount for prefilled values', async () => {
    const fetchSuggestions = jest.fn().mockResolvedValue(['Chevrolet']);

    render(
      <StrictMode>
        <AutocompleteInput
          id="carBrand"
          name="carBrand"
          label="Car Brand"
          value="Chevrolet"
          onChange={jest.fn()}
          onBlur={jest.fn()}
          fetchSuggestions={fetchSuggestions}
        />
      </StrictMode>
    );

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(fetchSuggestions).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('list', { name: /car brand suggestions/i })
    ).not.toBeInTheDocument();
  });
});
