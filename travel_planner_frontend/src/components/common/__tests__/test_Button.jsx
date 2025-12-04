import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  test('calls onClick when enabled', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(onClick).toHaveBeenCalled();
  });

  test('does not call onClick when disabled', () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>
    );
    fireEvent.click(screen.getByRole('button', { name: /disabled/i }));
    expect(onClick).not.toHaveBeenCalled();
  });

  test('supports variant prop without errors', () => {
    const { rerender } = render(<Button variant="secondary">V</Button>);
    rerender(<Button variant="ghost">V</Button>);
    rerender(<Button variant="primary">V</Button>);
    expect(screen.getByRole('button', { name: 'V' })).toBeInTheDocument();
  });
});
