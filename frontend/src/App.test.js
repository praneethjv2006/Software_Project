import { render, screen } from '@testing-library/react';
import App from './App';

test('renders entry page heading', () => {
  // Tests the default entry page rendering.
  render(<App />);
  const headingElement = screen.getByText(/enter the auction/i);
  expect(headingElement).toBeInTheDocument();
});
