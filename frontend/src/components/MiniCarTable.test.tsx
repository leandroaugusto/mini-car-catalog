import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
      '/placeholder-mini-car.png'
    );
  });

  it('calls edit and delete handlers for row actions', async () => {
    const user = userEvent.setup();
    const item = {
      id: '1',
      carBrand: 'Ford',
      carModel: 'Mustang',
      carYear: 1967,
      miniBrand: 'Hot Wheels',
      miniScale: '1:64',
      photoFilename: 'mustang.webp',
      photoOriginalName: 'mustang.webp',
      photoUrl: '/uploads/mustang.webp',
      createdAt: '2026-06-14T00:00:00.000Z',
      updatedAt: '2026-06-14T00:00:00.000Z',
    };
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(<MiniCarTable items={[item]} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(onEdit).toHaveBeenCalledWith(item);
    expect(onDelete).toHaveBeenCalledWith(item);
  });
});
