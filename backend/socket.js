const { Server } = require('socket.io');
const { emitRoomUpdate, setBoughtItemOrder } = require('./controllers/roomController');
const { processBid } = require('./lib/bidProcessor');
const { getRoomSubject } = require('./lib/observerRegistry');
const { setIo } = require('./lib/socketStore');

const presenceByRoom = new Map();

function getRoomPresence(roomId) {
  if (!presenceByRoom.has(roomId)) {
    presenceByRoom.set(roomId, new Map());
  }
  return presenceByRoom.get(roomId);
}

function buildPresencePayload(roomId) {
  const roomPresence = getRoomPresence(roomId);
  const participants = [];
  const organizers = [];

  for (const entry of roomPresence.values()) {
    if (entry.role === 'participant') {
      participants.push(entry);
    } else if (entry.role === 'organizer') {
      organizers.push(entry);
    }
  }

  return { participants, organizers };
}

function attachSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  setIo(io);

  io.on('connection', (socket) => {
    socket.on('joinRoom', async ({ roomId, role, participantId, organizerId, sessionId }) => {
      const parsedRoomId = Number(roomId);
      if (Number.isNaN(parsedRoomId)) {
        return;
      }

      const roomPresence = getRoomPresence(parsedRoomId);
      const presenceEntry = {
        id: socket.id,
        role,
        participantId: participantId || null,
        organizerId: organizerId || null,
        sessionId: sessionId || socket.id,
        active: true,
      };
      roomPresence.set(socket.id, presenceEntry);

      socket.join(`room:${parsedRoomId}`);

      if (role === 'participant' && participantId) {
        socket.join(`participant:${participantId}`);
        const subject = getRoomSubject(parsedRoomId);
        subject.addObserver({ id: participantId });
      }

      await emitRoomUpdate(parsedRoomId);
      io.to(`room:${parsedRoomId}`).emit('presence:update', buildPresencePayload(parsedRoomId));
    });

    socket.on('placeBid', async ({ roomId, participantId, amount, strategy, increment, maxBid }) => {
      const result = await processBid({
        roomId,
        participantId,
        amount,
        strategy,
        increment,
        maxBid,
      });

      if (!result.ok) {
        socket.emit('bid:error', { message: result.error || 'Bid failed' });
      }
    });

    socket.on('reorderBoughtItems', async ({ roomId, participantId, itemIds }) => {
      const parsedRoomId = Number(roomId);
      const parsedParticipantId = Number(participantId);
      if (Number.isNaN(parsedRoomId) || Number.isNaN(parsedParticipantId) || !Array.isArray(itemIds)) {
        socket.emit('order:error', { message: 'Invalid reorder payload' });
        return;
      }

      const roomPresence = getRoomPresence(parsedRoomId);
      const session = roomPresence.get(socket.id);
      if (!session || session.role !== 'participant' || Number(session.participantId) !== parsedParticipantId) {
        socket.emit('order:error', { message: 'You can only reorder your own items' });
        return;
      }

      const parsedItemIds = itemIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id));
      const result = await setBoughtItemOrder(parsedRoomId, parsedParticipantId, parsedItemIds);
      if (!result.ok) {
        socket.emit('order:error', { message: result.error || 'Failed to update order' });
      }
    });

    socket.on('disconnect', () => {
      for (const [roomId, roomPresence] of presenceByRoom.entries()) {
        if (roomPresence.has(socket.id)) {
          const entry = roomPresence.get(socket.id);
          roomPresence.delete(socket.id);
          if (entry && entry.role === 'participant' && entry.participantId) {
            const subject = getRoomSubject(roomId);
            subject.removeObserver({ id: entry.participantId });
          }
          io.to(`room:${roomId}`).emit('presence:update', buildPresencePayload(roomId));
        }
      }
    });
  });

  return io;
}

module.exports = { attachSocket };
