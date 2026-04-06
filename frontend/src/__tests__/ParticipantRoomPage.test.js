import { render, screen, waitFor } from '@testing-library/react';
import ParticipantRoomPage from '../ParticipantRoomPage';
import { io } from 'socket.io-client';

jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

const makeSocket = () => ({
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
});

describe('ParticipantRoomPage', () => {
  beforeEach(() => {
    io.mockReturnValue(makeSocket());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders room details after fetch', async () => {
    // Tests initial room fetch and rendering.
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1,
        roomName: 'Room A',
        status: 'live',
        currentItem: null,
        participants: [],
        items: [],
        autoAuction: { enabled: false },
      }),
    });

    render(
      <ParticipantRoomPage
        participant={{ id: 9, remainingPurse: 100 }}
        roomId={1}
        onBack={() => {}}
      />
    );

    expect(await screen.findByText('Room Room A')).toBeInTheDocument();
    expect(screen.getByText('Room ID: 1')).toBeInTheDocument();
  });

  it('shows error banner when fetch fails', async () => {
    // Tests error handling when room fetch fails.
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to load room' }),
    });

    render(
      <ParticipantRoomPage
        participant={{ id: 9, remainingPurse: 100 }}
        roomId={1}
        onBack={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load room')).toBeInTheDocument();
    });
  });
});
