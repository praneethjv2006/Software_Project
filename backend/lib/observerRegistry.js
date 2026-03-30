const { getIo } = require('./socketStore');

class AuctionRoomSubject {
  constructor(roomId) {
    this.roomId = roomId;
    this.observers = new Map();
  }

  addObserver(participant) {
    if (!participant) return;
    const id = participant.id != null ? participant.id : Number(participant);
    if (!Number.isNaN(Number(id))) {
      this.observers.set(String(id), participant);
    }
  }

  removeObserver(participant) {
    if (!participant) return;
    const id = participant.id != null ? participant.id : Number(participant);
    if (!Number.isNaN(Number(id))) {
      this.observers.delete(String(id));
    }
  }

  notifyObservers(payload) {
    const io = getIo();
    if (!io) return;

    if (this.observers.size) {
      for (const observerId of this.observers.keys()) {
        io.to(`participant:${observerId}`).emit('bid:new', payload);
      }
    }

    io.to(`room:${this.roomId}`).emit('bid:new', payload);
  }
}

const roomSubjects = new Map();

function getRoomSubject(roomId) {
  if (!roomSubjects.has(roomId)) {
    roomSubjects.set(roomId, new AuctionRoomSubject(roomId));
  }
  return roomSubjects.get(roomId);
}

module.exports = { getRoomSubject };
