import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EntryPage from '../EntryPage';

describe('EntryPage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('toggles between organizer and participant forms', async () => {
    // Tests role toggle and form visibility.
    render(<EntryPage onOrganizerLogin={() => {}} onParticipantLogin={() => {}} />);

    expect(screen.getByText('Organizer login')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Participant' }));
    expect(screen.getByText('Participant login')).toBeInTheDocument();
  });

  it('submits organizer login and calls handler', async () => {
    // Tests organizer login happy path.
    const onOrganizerLogin = jest.fn();
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, organizerCode: '1234' }),
    });

    render(<EntryPage onOrganizerLogin={onOrganizerLogin} onParticipantLogin={() => {}} />);

    await userEvent.type(screen.getByPlaceholderText('4-digit organizer ID'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Enter organizer dashboard' }));

    await waitFor(() => {
      expect(onOrganizerLogin).toHaveBeenCalledWith({ id: 1, organizerCode: '1234' });
    });
  });

  it('shows error when participant login fails', async () => {
    // Tests participant login error handling.
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Participant login failed' }),
    });

    render(<EntryPage onOrganizerLogin={() => {}} onParticipantLogin={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: 'Participant' }));
    await userEvent.type(screen.getByPlaceholderText('Room ID'), '1');
    await userEvent.type(screen.getByPlaceholderText('6-digit participant ID'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Enter room' }));

    expect(await screen.findByText('Participant login failed')).toBeInTheDocument();
  });
});
