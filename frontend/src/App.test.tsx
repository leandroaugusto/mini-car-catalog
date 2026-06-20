import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';
import { deleteMiniCar } from './api/miniCars';
import { useMiniCars } from './hooks/useMiniCars';

jest.mock('./api/miniCars', () => ({
  createMiniCar: jest.fn(),
  updateMiniCar: jest.fn(),
  deleteMiniCar: jest.fn(),
  fetchBrandSuggestions: jest.fn(),
  fetchCollectionSuggestions: jest.fn(),
  fetchModelSuggestions: jest.fn(),
  fetchMiniBrandSuggestions: jest.fn(),
}));

jest.mock('./hooks/useMiniCars');

const mockedDeleteMiniCar = jest.mocked(deleteMiniCar);
const mockedUseMiniCars = jest.mocked(useMiniCars);

const item = {
  id: '1',
  carBrand: 'Ford',
  carModel: 'Mustang',
  carYear: 1967,
  miniBrand: 'Hot Wheels',
  collection: 'Muscle Cars',
  miniScale: '1:64',
  photoFilename: 'mustang.png',
  photoOriginalName: 'mustang.png',
  photoPath: '/tmp/mustang.png',
  photoUrl: '/uploads/mustang.png',
  createdAt: '2026-06-14T00:00:00.000Z',
  updatedAt: '2026-06-14T00:00:00.000Z',
};

function mockCatalogState(overrides?: Partial<ReturnType<typeof useMiniCars>>) {
  const refresh = jest.fn();

  mockedUseMiniCars.mockReturnValue({
    items: [item],
    loading: false,
    error: null,
    filters: {
      search: '',
      carBrand: '',
      carModel: '',
      carYear: '',
      miniBrand: '',
      collection: '',
      miniScale: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      pageSize: 10,
    },
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
    },
    setFilters: jest.fn(),
    refresh,
    ...overrides,
  });

  return { refresh };
}

describe('App', () => {
  beforeEach(() => {
    mockedDeleteMiniCar.mockReset().mockResolvedValue(undefined);
    window.localStorage.clear();
  });

  it('renders the catalog heading and toggles between table and card views', async () => {
    const user = userEvent.setup();
    mockCatalogState();

    render(<App />);

    expect(
      screen.getByRole('heading', { name: /mini car catalog/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cards/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await user.click(screen.getByRole('button', { name: /table/i }));

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('loads the saved table view preference from localStorage', () => {
    window.localStorage.setItem('mini-car-catalog:view-preference', JSON.stringify('table'));
    mockCatalogState();

    render(<App />);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('saves the selected view preference to localStorage', async () => {
    const user = userEvent.setup();
    mockCatalogState();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /table/i }));

    expect(window.localStorage.getItem('mini-car-catalog:view-preference')).toBe(
      JSON.stringify('table')
    );
  });

  it('opens and cancels the delete confirmation modal', async () => {
    const user = userEvent.setup();
    mockCatalogState();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /delete/i }));

    const dialog = screen.getByRole('dialog', { name: /delete mini car/i });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/ford mustang/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));

    expect(screen.queryByRole('dialog', { name: /delete mini car/i })).not.toBeInTheDocument();
    expect(mockedDeleteMiniCar).not.toHaveBeenCalled();
  });

  it('confirms deletion through the modal', async () => {
    const user = userEvent.setup();
    const { refresh } = mockCatalogState();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(
      within(screen.getByRole('dialog', { name: /delete mini car/i })).getByRole('button', {
        name: /^delete$/i,
      })
    );

    await waitFor(() => {
      expect(mockedDeleteMiniCar).toHaveBeenCalledWith('1');
      expect(refresh).toHaveBeenCalled();
    });

    expect(screen.queryByRole('dialog', { name: /delete mini car/i })).not.toBeInTheDocument();
  });

  it('renders clickable page numbers in the footer', async () => {
    const user = userEvent.setup();
    const setFilters = jest.fn();

    mockCatalogState({
      filters: {
        search: '',
        carBrand: '',
        carModel: '',
        carYear: '',
        miniBrand: '',
        collection: '',
        miniScale: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 3,
        pageSize: 20,
      },
      pagination: {
        page: 3,
        pageSize: 20,
        totalItems: 90,
        totalPages: 5,
      },
      setFilters,
    });

    render(<App />);

    expect(screen.getByRole('button', { name: '3' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '4' }));

    expect(setFilters).toHaveBeenCalledWith({ page: 4 });
  });

  it('renders an error alert when the catalog fails to load', () => {
    mockCatalogState({
      items: [],
      error: 'Failed to load catalog',
    });

    render(<App />);

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load catalog');
  });

  it('renders loading skeletons while the catalog is loading', () => {
    mockCatalogState({
      items: [],
      loading: true,
    });

    render(<App />);

    expect(screen.getAllByText((_, element) => element?.className.includes('animate-pulse') ?? false).length).toBeGreaterThan(0);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the empty state and opens the create form from it', async () => {
    const user = userEvent.setup();

    mockCatalogState({
      items: [],
      pagination: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 1,
      },
    });

    render(<App />);

    expect(
      screen.getByRole('heading', { name: /your showroom is ready for its first mini car/i })
    ).toBeInTheDocument();

    const addButtons = screen.getAllByRole('button', { name: /add mini car/i });
    await user.click(addButtons[1]);

    expect(screen.getByRole('heading', { name: /add a new mini car/i })).toBeInTheDocument();
  });

  it('navigates with previous and next pagination buttons', async () => {
    const user = userEvent.setup();
    const setFilters = jest.fn();

    mockCatalogState({
      filters: {
        search: '',
        carBrand: '',
        carModel: '',
        carYear: '',
        miniBrand: '',
        collection: '',
        miniScale: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 2,
        pageSize: 20,
      },
      pagination: {
        page: 2,
        pageSize: 20,
        totalItems: 90,
        totalPages: 5,
      },
      setFilters,
    });

    render(<App />);

    await user.click(screen.getByRole('button', { name: /previous/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(setFilters).toHaveBeenNthCalledWith(1, { page: 1 });
    expect(setFilters).toHaveBeenNthCalledWith(2, { page: 3 });
  });
});
