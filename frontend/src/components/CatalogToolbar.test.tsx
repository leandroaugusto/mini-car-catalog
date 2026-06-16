import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  fetchBrandSuggestions,
  fetchCollectionSuggestions,
  fetchMiniBrandSuggestions,
  fetchModelSuggestions,
} from '../api/miniCars';
import { CatalogToolbar } from './CatalogToolbar';

jest.mock('../api/miniCars', () => ({
  fetchBrandSuggestions: jest.fn(),
  fetchCollectionSuggestions: jest.fn(),
  fetchModelSuggestions: jest.fn(),
  fetchMiniBrandSuggestions: jest.fn(),
}));

const mockedFetchBrandSuggestions = jest.mocked(fetchBrandSuggestions);
const mockedFetchCollectionSuggestions = jest.mocked(fetchCollectionSuggestions);
const mockedFetchModelSuggestions = jest.mocked(fetchModelSuggestions);
const mockedFetchMiniBrandSuggestions = jest.mocked(fetchMiniBrandSuggestions);

const filters = {
  search: '',
  carBrand: '',
  carModel: '',
  carYear: '',
  miniBrand: '',
  collection: '',
  miniScale: '',
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
  page: 1,
  pageSize: 20,
};

describe('CatalogToolbar', () => {
  beforeEach(() => {
    mockedFetchBrandSuggestions.mockReset().mockResolvedValue([]);
    mockedFetchCollectionSuggestions.mockReset().mockResolvedValue([]);
    mockedFetchModelSuggestions.mockReset().mockResolvedValue([]);
    mockedFetchMiniBrandSuggestions.mockReset().mockResolvedValue([]);
  });

  it('uses the same searchable year dropdown behavior in filters', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onChange = jest.fn();

    jest.useFakeTimers();

    try {
      render(
        <CatalogToolbar filters={filters} onChange={onChange} onCreate={jest.fn()} />
      );

      const yearInput = screen.getByRole('textbox', { name: /car year/i });

      expect(screen.queryByRole('spinbutton', { name: /car year/i })).not.toBeInTheDocument();

      await user.type(yearInput, '190');

      await waitFor(() => {
        jest.advanceTimersByTime(300);
        expect(screen.getByRole('button', { name: '1900' })).toBeInTheDocument();
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('splits actions and filters into separate sections with filters expanded by default', () => {
    render(<CatalogToolbar filters={filters} onChange={jest.fn()} onCreate={jest.fn()} />);

    expect(
      screen.getByRole('heading', { name: /manage collection/i })
    ).toBeInTheDocument();

    const filtersToggle = screen.getByRole('button', { name: /catalog filters/i });

    expect(filtersToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument();
  });

  it('collapses and re-expands filters without losing values', async () => {
    const user = userEvent.setup();

    render(
      <CatalogToolbar
        filters={{ ...filters, search: 'Mustang' }}
        onChange={jest.fn()}
        onCreate={jest.fn()}
      />
    );

    const filtersToggle = screen.getByRole('button', { name: /catalog filters/i });

    await user.click(filtersToggle);
    expect(filtersToggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('textbox', { name: /search/i })).not.toBeInTheDocument();

    await user.click(filtersToggle);
    expect(filtersToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('textbox', { name: /search/i })).toHaveValue('Mustang');
  });

  it('collapses filters when add mini car is clicked', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();

    render(<CatalogToolbar filters={filters} onChange={jest.fn()} onCreate={onCreate} />);

    await user.click(screen.getByRole('button', { name: /add mini car/i }));

    expect(onCreate).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /catalog filters/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByRole('textbox', { name: /search/i })).not.toBeInTheDocument();
  });

  it('renders mini scale as a dropdown with preset options', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <CatalogToolbar filters={filters} onChange={onChange} onCreate={jest.fn()} />
    );

    const scaleSelect = screen.getByRole('combobox', { name: /mini scale/i });
    const scaleOptions = Array.from(scaleSelect.querySelectorAll('option')).map(
      (option) => option.textContent
    );

    expect(scaleSelect).toBeInTheDocument();
    expect(scaleOptions).toEqual([
      'All scales',
      '1:87',
      '1:64',
      '1:43',
      '1:32',
      '1:24',
      '1:18',
    ]);

    await user.selectOptions(scaleSelect, '1:24');

    expect(onChange).toHaveBeenCalledWith({ miniScale: '1:24' });
  });

  it('renders items per page options with 20 selected by default', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <CatalogToolbar filters={filters} onChange={onChange} onCreate={jest.fn()} />
    );

    const pageSizeSelect = screen.getByRole('combobox', { name: /items per page/i });
    const pageSizeOptions = Array.from(pageSizeSelect.querySelectorAll('option')).map(
      (option) => option.textContent
    );

    expect(pageSizeSelect).toHaveValue('20');
    expect(pageSizeOptions).toEqual(['20 items', '50 items', '100 items']);

    await user.selectOptions(pageSizeSelect, '100');

    expect(onChange).toHaveBeenCalledWith({ pageSize: 100, page: 1 });
  });

  it('shows clear actions for plain text filters', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <CatalogToolbar
        filters={{ ...filters, search: 'Mustang', carBrand: 'Ford' }}
        onChange={onChange}
        onCreate={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /clear search/i }));
    expect(onChange).toHaveBeenCalledWith({ search: '' });

    await user.click(screen.getByRole('button', { name: /clear car brand/i }));
    expect(onChange).toHaveBeenCalledWith({ carBrand: '', carModel: '' });
  });

  it('uses autocomplete for car brand and mini brand filters', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    jest.useFakeTimers();

    try {
      render(<CatalogToolbar filters={filters} onChange={jest.fn()} onCreate={jest.fn()} />);

      await user.type(screen.getByRole('textbox', { name: /car brand/i }), 'Fo');
      await user.type(screen.getByRole('textbox', { name: /mini brand/i }), 'Ho');

      await waitFor(() => {
        jest.advanceTimersByTime(300);
        expect(mockedFetchBrandSuggestions).toHaveBeenCalledWith('Fo');
        expect(mockedFetchMiniBrandSuggestions).toHaveBeenCalledWith('Ho');
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('uses autocomplete for the collection filter', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    jest.useFakeTimers();

    try {
      render(<CatalogToolbar filters={filters} onChange={jest.fn()} onCreate={jest.fn()} />);

      await user.type(screen.getByRole('textbox', { name: /collection/i }), 'Mu');

      await waitFor(() => {
        jest.advanceTimersByTime(300);
        expect(mockedFetchCollectionSuggestions).toHaveBeenCalledWith('Mu');
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('matches car model filter behavior with the form', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    jest.useFakeTimers();

    try {
      const { rerender } = render(
        <CatalogToolbar filters={filters} onChange={jest.fn()} onCreate={jest.fn()} />
      );

      expect(screen.getByRole('textbox', { name: /car model/i })).toBeDisabled();

      rerender(
        <CatalogToolbar
          filters={{ ...filters, carBrand: 'Ford' }}
          onChange={jest.fn()}
          onCreate={jest.fn()}
        />
      );

      await user.type(screen.getByRole('textbox', { name: /car model/i }), 'Mu');

      await waitFor(() => {
        jest.advanceTimersByTime(300);
        expect(mockedFetchModelSuggestions).toHaveBeenCalledWith('Mu', 'Ford');
      });
    } finally {
      jest.useRealTimers();
    }
  });
});
