import { render, screen } from '@testing-library/react';

import { MiniCarCards } from './MiniCarCards';

describe('MiniCarCards', () => {
  it('renders the car year as a single label over the image', () => {
    render(
      <MiniCarCards
        items={[
          {
            id: '1',
            carBrand: 'Ford',
            carModel: 'Mustang',
            carYear: 1967,
            miniBrand: 'Hot Wheels',
            miniScale: '1:64',
            photoFilename: 'mustang.png',
            photoOriginalName: 'mustang.png',
            photoPath: '/tmp/mustang.png',
            photoUrl: '/uploads/mustang.png',
            createdAt: '2026-06-14T00:00:00.000Z',
            updatedAt: '2026-06-14T00:00:00.000Z',
          },
        ]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    const yearLabels = screen.getAllByText('1967');

    expect(yearLabels).toHaveLength(1);
    expect(yearLabels[0]).toHaveClass('absolute', 'bottom-4', 'left-4', 'text-sm');
  });

  it('renders the scale chip without the word scale', () => {
    render(
      <MiniCarCards
        items={[
          {
            id: '1',
            carBrand: 'Ford',
            carModel: 'Mustang',
            carYear: 1967,
            miniBrand: 'Hot Wheels',
            miniScale: '1:64',
            photoFilename: 'mustang.png',
            photoOriginalName: 'mustang.png',
            photoPath: '/tmp/mustang.png',
            photoUrl: '/uploads/mustang.png',
            createdAt: '2026-06-14T00:00:00.000Z',
            updatedAt: '2026-06-14T00:00:00.000Z',
          },
        ]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText('1:64', { selector: 'span' })).toBeInTheDocument();
    expect(screen.queryByText('Scale 1:64')).not.toBeInTheDocument();
  });

  it('renders a placeholder image when the item has no photo', () => {
    render(
      <MiniCarCards
        items={[
          {
            id: '1',
            carBrand: 'Ferrari',
            carModel: 'F40',
            carYear: 1987,
            miniBrand: 'Hot Wheels',
            miniScale: '1:64',
            photoFilename: undefined,
            photoOriginalName: undefined,
            photoPath: undefined,
            photoUrl: undefined,
            createdAt: '2026-06-14T00:00:00.000Z',
            updatedAt: '2026-06-14T00:00:00.000Z',
          },
        ]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByRole('img', { name: /ferrari f40/i })).toHaveAttribute(
      'src',
      '/placeholder-mini-car.svg'
    );
  });
});
