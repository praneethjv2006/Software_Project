import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

describe('Integration: App flow', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs in organizer and shows dashboard', async () => {
    // Tests entry page -> organizer dashboard flow.
    jest.spyOn(global, 'fetch').mockImplementation((url, options) => {
      if (url.includes('/organizer/login') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 1, organizerCode: '1234', name: 'Org', email: 'org@example.com' }),
        });
      }
      if (url.includes('/rooms?organizerId=')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, roomName: 'Room A', participants: [], items: [], status: 'draft' }],
        });
      }
      return Promise.resolve({ ok: false, json: async () => ({ error: 'Unexpected' }) });
    });

    render(<App />);

    await userEvent.type(screen.getByPlaceholderText('4-digit organizer ID'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Enter organizer dashboard' }));

    await waitFor(() => {
      expect(screen.getByText('Organizer room control')).toBeInTheDocument();
      expect(screen.getByText('Room A', { selector: 'strong' })).toBeInTheDocument();
    });
  });
});
