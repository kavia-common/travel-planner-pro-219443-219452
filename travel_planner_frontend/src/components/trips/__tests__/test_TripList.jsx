import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TripList from '../TripList';

describe('TripList', () => {
  test('renders empty state when no trips', () => {
    render(<TripList trips={[]} />);
    expect(screen.getByText(/no trips available/i)).toBeInTheDocument();
  });

  test('renders items and triggers actions', () => {
    const trips = [
      { id: 't1', name: 'Trip One', description: 'Desc1' },
      { id: 't2', name: 'Trip Two' },
    ];
    const onView = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(<TripList trips={trips} onView={onView} onEdit={onEdit} onDelete={onDelete} />);

    // Ensure items rendered
    expect(screen.getByText(/trip one/i)).toBeInTheDocument();
    expect(screen.getByText(/trip two/i)).toBeInTheDocument();

    // Click actions on first item
    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });

    fireEvent.click(viewButtons[0]);
    fireEvent.click(editButtons[0]);
    fireEvent.click(removeButtons[0]);

    expect(onView).toHaveBeenCalledWith(trips[0]);
    expect(onEdit).toHaveBeenCalledWith(trips[0]);
    expect(onDelete).toHaveBeenCalledWith(trips[0]);
  });
});
