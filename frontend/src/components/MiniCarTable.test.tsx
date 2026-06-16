import { render, screen } from '@testing-library/react';

import { MiniCarTable } from './MiniCarTable';

describe('MiniCarTable', () => {
  it('renders a placeholder image when the item has no photo', () => {
    render(
      <MiniCarTable
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
