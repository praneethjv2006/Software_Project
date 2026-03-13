
import React, { useState } from 'react';
import './App.css';
import usePage from './usePage';
import EntryPage from './EntryPage';
import OrganizerDashboard from './OrganizerDashboard';
import OrganizerRoomPage from './OrganizerRoomPage';
import ParticipantRoomPage from './ParticipantRoomPage';

function App() {
  const [page, goto] = usePage('entry');
  const [organizer, setOrganizer] = useState(null);
  const [participant, setParticipant] = useState(null);

  if (page.name === 'entry') {
    return (
      <EntryPage
        onOrganizerLogin={(data) => {
          setOrganizer(data);
          goto('organizer-dashboard');
        }}
        onParticipantLogin={({ participant: participantData, roomId }) => {
          setParticipant({ ...participantData, roomId });
          goto('participant-room', { roomId, participantId: participantData.id });
        }}
      />
    );
  }

  if (page.name === 'organizer-dashboard' && organizer) {
    return (
      <OrganizerDashboard
        organizer={organizer}
        onEnterRoom={(roomId) => goto('organizer-room', { roomId })}
        onLogout={() => {
          setOrganizer(null);
          goto('entry');
        }}
      />
    );
  }

  if (page.name === 'organizer-room' && organizer) {
    return (
      <main className="app-shell">
        <OrganizerRoomPage
          roomId={page.props.roomId}
          organizer={organizer}
          onBack={() => goto('organizer-dashboard')}
        />
      </main>
    );
  }

  if (page.name === 'participant-room' && participant) {
    return (
      <main className="app-shell">
        <ParticipantRoomPage
          participant={participant}
          roomId={participant.roomId}
          onBack={() => {
            setParticipant(null);
            goto('entry');
          }}
        />
      </main>
    );
  }

  return <EntryPage onOrganizerLogin={() => {}} onParticipantLogin={() => {}} />;
}

export default App;
