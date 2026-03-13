import { render, screen } from '@testing-library/react';
import App from './App';

test('renders entry page heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/enter the auction/i);
  expect(headingElement).toBeInTheDocument();
});
