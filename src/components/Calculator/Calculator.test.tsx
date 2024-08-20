import { render, screen, fireEvent } from '@testing-library/react';
import Calculator from './Calculator';

test('renders calculator', () => {
  render(<Calculator />);
  expect(screen.getByText('0')).toBeInTheDocument();
});

test('can handle button clicks', () => {
  render(<Calculator />);
  fireEvent.click(screen.getByText('1'));
  expect(screen.getByText('1')).toBeInTheDocument();
});

test('calculates results', () => {
  render(<Calculator />);
  fireEvent.click(screen.getByText('1'));
  fireEvent.click(screen.getByText('+'));
  fireEvent.click(screen.getByText('1'));
  fireEvent.click(screen.getByText('='));
  expect(screen.getByText('2')).toBeInTheDocument();
});
