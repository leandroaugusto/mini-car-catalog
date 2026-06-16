import { act, renderHook } from '@testing-library/react';

import { useLocalStorageState } from './useLocalStorageState';

describe('useLocalStorageState', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('reads an existing value from localStorage', () => {
    window.localStorage.setItem('view-preference', JSON.stringify('table'));

    const { result } = renderHook(() =>
      useLocalStorageState<'table' | 'cards'>('view-preference', 'cards')
    );

    expect(result.current[0]).toBe('table');
  });

  it('writes updates back to localStorage', () => {
    const { result } = renderHook(() =>
      useLocalStorageState<'table' | 'cards'>('view-preference', 'cards')
    );

    act(() => {
      result.current[1]('table');
    });

    expect(window.localStorage.getItem('view-preference')).toBe(JSON.stringify('table'));
  });

  it('falls back to the default value when the stored value is invalid', () => {
    window.localStorage.setItem('view-preference', JSON.stringify('other'));

    const { result } = renderHook(() =>
      useLocalStorageState<'table' | 'cards'>('view-preference', 'cards', {
        isValid: (value): value is 'table' | 'cards' => value === 'table' || value === 'cards',
      })
    );

    expect(result.current[0]).toBe('cards');
  });
});
