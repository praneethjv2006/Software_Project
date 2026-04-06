import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrganizerDashboard from '../OrganizerDashboard';

describe('OrganizerDashboard', () => {
  const organizer = { id: 1, organizerCode: '1234', name: 'Org', email: 'org@example.com' };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads rooms and updates status', async () => {
    // Tests initial rooms fetch and status update.
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, roomName: 'Room A', participants: [], items: [], status: 'draft' }],
    });

    render(<OrganizerDashboard organizer={organizer} onEnterRoom={() => {}} onLogout={() => {}} />);

    expect(await screen.findByText('Rooms loaded.')).toBeInTheDocument();
    expect(screen.getByText('Room A', { selector: 'strong' })).toBeInTheDocument();
  });

  it('creates a room and reloads rooms', async () => {
    // Tests room creation flow and refresh.
    jest.spyOn(global, 'fetch').mockImplementation((url, options) => {
      if (url.includes('/rooms?')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 2, roomName: 'Room B', participants: [], items: [], status: 'draft' }],
        });
      }
      if (url.endsWith('/rooms') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 2, roomName: 'Room B' }),
        });
      }
      return Promise.resolve({ ok: false, json: async () => ({ error: 'Unexpected' }) });
    });

    render(<OrganizerDashboard organizer={organizer} onEnterRoom={() => {}} onLogout={() => {}} />);

    await userEvent.type(screen.getByPlaceholderText('Room name'), 'Room B');
    await userEvent.click(screen.getByRole('button', { name: 'Create room' }));

    await waitFor(() => {
      expect(screen.getByText('Room B', { selector: 'strong' })).toBeInTheDocument();
    });
  });

  it('shows empty state when no room selected', async () => {
    // Tests empty state UI when rooms are missing.
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<OrganizerDashboard organizer={organizer} onEnterRoom={() => {}} onLogout={() => {}} />);

    expect(await screen.findByText('No rooms created yet.')).toBeInTheDocument();
    expect(screen.getByText('Create a room, then click it to manage participants and items.')).toBeInTheDocument();
  });
});
