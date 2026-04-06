import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

jest.mock('../EntryPage', () => ({
  __esModule: true,
  default: ({ onOrganizerLogin }) => (
    <button type="button" onClick={() => onOrganizerLogin({ id: 1, organizerCode: '1234' })}>
      Mock Organizer Login
    </button>
  ),
}));

jest.mock('../OrganizerDashboard', () => ({
  __esModule: true,
  default: ({ organizer }) => <div>Organizer Dashboard {organizer.organizerCode}</div>,
}));

jest.mock('../OrganizerRoomPage', () => ({
  __esModule: true,
  default: () => <div>Organizer Room</div>,
}));

jest.mock('../ParticipantRoomPage', () => ({
  __esModule: true,
  default: () => <div>Participant Room</div>,
}));

describe('App navigation', () => {
  it('navigates to organizer dashboard after login', async () => {
    // Tests page transitions from entry to organizer dashboard.
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Mock Organizer Login' }));
    expect(screen.getByText('Organizer Dashboard 1234')).toBeInTheDocument();
  });
});
