import { StrictMode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MiniCarForm } from './MiniCarForm';

describe('MiniCarForm', () => {
  it('shows a preview when a new image file is selected', async () => {
    const user = userEvent.setup();
    const createObjectURL = jest.fn().mockReturnValue('blob:preview-image');
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: createObjectURL,
    });

    render(
      <MiniCarForm
        mode="create"
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
        fetchBrandSuggestions={jest.fn().mockResolvedValue([])}
        fetchModelSuggestions={jest.fn().mockResolvedValue([])}
        fetchMiniBrandSuggestions={jest.fn().mockResolvedValue([])}
        fetchCollectionSuggestions={jest.fn().mockResolvedValue([])}
      />
    );

    const fileInput = screen.getByLabelText(/photo/i);
    const file = new File(['preview'], 'preview.png', { type: 'image/png' });

    await user.upload(fileInput, file);

    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(
      screen.getByRole('img', { name: /current mini car/i })
    ).toHaveAttribute('src', 'blob:preview-image');
  });

  it('renders mini scale as a dropdown with preset options', () => {
    render(
      <MiniCarForm
        mode="create"
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
        fetchBrandSuggestions={jest.fn().mockResolvedValue([])}
        fetchModelSuggestions={jest.fn().mockResolvedValue([])}
        fetchMiniBrandSuggestions={jest.fn().mockResolvedValue([])}
        fetchCollectionSuggestions={jest.fn().mockResolvedValue([])}
      />
    );

    const scaleSelect = screen.getByRole('combobox', { name: /mini scale/i });
    const scaleOptions = screen
      .getAllByRole('option')
      .map((option) => option.textContent);

    expect(scaleSelect).toBeInTheDocument();
    expect(scaleOptions).toEqual([
      'Select a scale',
      '1:87',
      '1:64',
      '1:43',
      '1:32',
      '1:24',
      '1:18',
    ]);
  });

  it('uses a searchable dropdown for car year suggestions', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    jest.useFakeTimers();

    try {
      render(
        <MiniCarForm
          mode="create"
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          fetchBrandSuggestions={jest.fn().mockResolvedValue([])}
          fetchModelSuggestions={jest.fn().mockResolvedValue([])}
          fetchMiniBrandSuggestions={jest.fn().mockResolvedValue([])}
          fetchCollectionSuggestions={jest.fn().mockResolvedValue([])}
        />
      );

      const yearInput = screen.getByRole('textbox', { name: /car year/i });

      expect(
        screen.queryByRole('spinbutton', { name: /car year/i })
      ).not.toBeInTheDocument();

      await user.type(yearInput, '190');

      await waitFor(() => {
        jest.advanceTimersByTime(300);
        expect(
          screen.getByRole('button', { name: '1900' })
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('list', { name: /car year suggestions/i })
      ).toHaveClass('max-h-64');
    } finally {
      jest.useRealTimers();
    }
  });

  it('shows validation errors for missing required fields', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(
      <MiniCarForm
        mode="create"
        onSubmit={onSubmit}
        onCancel={jest.fn()}
        fetchBrandSuggestions={jest.fn().mockResolvedValue([])}
        fetchModelSuggestions={jest.fn().mockResolvedValue([])}
        fetchMiniBrandSuggestions={jest.fn().mockResolvedValue([])}
        fetchCollectionSuggestions={jest.fn().mockResolvedValue([])}
      />
    );

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/car brand is required/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/car model is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/car year must be a valid year/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/mini brand is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/mini scale must use the format 1:64/i)
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('allows submitting without a photo', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(
      <MiniCarForm
        mode="create"
        onSubmit={onSubmit}
        onCancel={jest.fn()}
        fetchBrandSuggestions={jest.fn().mockResolvedValue([])}
        fetchModelSuggestions={jest.fn().mockResolvedValue([])}
        fetchMiniBrandSuggestions={jest.fn().mockResolvedValue([])}
        fetchCollectionSuggestions={jest.fn().mockResolvedValue([])}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /car brand/i }),
      'Ferrari'
    );
    await user.type(screen.getByRole('textbox', { name: /car model/i }), 'F40');
    await user.type(screen.getByRole('textbox', { name: /car year/i }), '1987');
    await user.type(
      screen.getByRole('textbox', { name: /mini brand/i }),
      'Hot Wheels'
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: /mini scale/i }),
      '1:64'
    );
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    expect(screen.queryByText(/photo is required/i)).not.toBeInTheDocument();
  });

  it('clears the current model when the brand changes', async () => {
    const user = userEvent.setup();

    render(
      <MiniCarForm
        mode="edit"
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
        initialValues={{
          carBrand: 'Ford',
          carModel: 'Mustang',
          carYear: '1967',
          miniBrand: 'Hot Wheels',
          collection: 'Muscle Cars',
          miniScale: '1:64',
          photo: null,
          photoUrl: '/uploads/mustang.png',
        }}
        fetchBrandSuggestions={jest
          .fn()
          .mockResolvedValue(['Ford', 'Chevrolet'])}
        fetchModelSuggestions={jest.fn().mockResolvedValue(['Mustang'])}
        fetchMiniBrandSuggestions={jest.fn().mockResolvedValue(['Hot Wheels'])}
        fetchCollectionSuggestions={jest
          .fn()
          .mockResolvedValue(['Muscle Cars'])}
      />
    );

    const brandInput = screen.getByRole('textbox', { name: /car brand/i });
    const modelInput = screen.getByRole('textbox', { name: /car model/i });

    await user.clear(brandInput);
    await user.type(brandInput, 'Chevrolet');

    expect(modelInput).toHaveValue('');
  });

  it('uses autocomplete for the mini brand field', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const fetchMiniBrandSuggestions = jest
      .fn()
      .mockResolvedValue(['Hot Wheels', 'Johnny Lightning']);

    jest.useFakeTimers();

    render(
      <MiniCarForm
        mode="create"
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
        fetchBrandSuggestions={jest.fn().mockResolvedValue([])}
        fetchModelSuggestions={jest.fn().mockResolvedValue([])}
        fetchMiniBrandSuggestions={fetchMiniBrandSuggestions}
        fetchCollectionSuggestions={jest.fn().mockResolvedValue([])}
      />
    );

    await user.type(screen.getByRole('textbox', { name: /mini brand/i }), 'Ho');

    expect(fetchMiniBrandSuggestions).not.toHaveBeenCalled();

    await waitFor(() => {
      jest.advanceTimersByTime(300);
      expect(fetchMiniBrandSuggestions).toHaveBeenCalledWith('Ho');
    });

    jest.useRealTimers();
  });

  it('uses autocomplete for the optional collection field', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const fetchCollectionSuggestions = jest
      .fn()
      .mockResolvedValue(['Movie Cars', 'Muscle Cars']);

    jest.useFakeTimers();

    try {
      render(
        <MiniCarForm
          mode="create"
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          fetchBrandSuggestions={jest.fn().mockResolvedValue([])}
          fetchModelSuggestions={jest.fn().mockResolvedValue([])}
          fetchMiniBrandSuggestions={jest.fn().mockResolvedValue([])}
          fetchCollectionSuggestions={fetchCollectionSuggestions}
        />
      );

      await user.type(
        screen.getByRole('textbox', { name: /collection/i }),
        'Mu'
      );

      expect(fetchCollectionSuggestions).not.toHaveBeenCalled();

      await waitFor(() => {
        jest.advanceTimersByTime(300);
        expect(fetchCollectionSuggestions).toHaveBeenCalledWith('Mu');
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('renders the current preview label before the gray preview area', () => {
    render(
      <MiniCarForm
        mode="create"
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
        fetchBrandSuggestions={jest.fn().mockResolvedValue([])}
        fetchModelSuggestions={jest.fn().mockResolvedValue([])}
        fetchMiniBrandSuggestions={jest.fn().mockResolvedValue([])}
        fetchCollectionSuggestions={jest.fn().mockResolvedValue([])}
      />
    );

    const previewLabel = screen.getByText(/current preview/i);

    expect(previewLabel.nextElementSibling).toHaveClass('bg-slate-50');
  });

  it('does not open car model suggestions on edit mount', async () => {
    const fetchModelSuggestions = jest.fn().mockResolvedValue(['Road Runner']);

    jest.useFakeTimers();

    try {
      render(
        <StrictMode>
          <MiniCarForm
            mode="edit"
            onSubmit={jest.fn()}
            onCancel={jest.fn()}
            initialValues={{
              carBrand: 'Plymouth',
              carModel: 'Road Runner',
              carYear: '1976',
              miniBrand: 'Johnny Lightning',
              collection: 'Movie Cars',
              miniScale: '1:64',
              photo: null,
              photoUrl: '/uploads/road-runner.png',
            }}
            fetchBrandSuggestions={jest.fn().mockResolvedValue(['Plymouth'])}
            fetchModelSuggestions={fetchModelSuggestions}
            fetchMiniBrandSuggestions={jest
              .fn()
              .mockResolvedValue(['Johnny Lightning'])}
            fetchCollectionSuggestions={jest
              .fn()
              .mockResolvedValue(['Movie Cars'])}
          />
        </StrictMode>
      );

      await waitFor(() => {
        jest.advanceTimersByTime(300);
      });

      expect(fetchModelSuggestions).not.toHaveBeenCalled();
      expect(
        screen.queryByRole('list', { name: /car model suggestions/i })
      ).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });
});
