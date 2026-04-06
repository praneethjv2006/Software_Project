import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import usePage from '../usePage';

function TestComponent() {
  const [page, goto] = usePage('entry');
  return (
    <div>
      <span>Page: {page.name}</span>
      <button type="button" onClick={() => goto('next')}>Go</button>
    </div>
  );
}

describe('usePage', () => {
  it('updates page state via goto', async () => {
    // Tests state transitions managed by the hook.
    render(<TestComponent />);

    expect(screen.getByText('Page: entry')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(screen.getByText('Page: next')).toBeInTheDocument();
  });
});
