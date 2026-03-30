class AuctionSystem {
  constructor() {
    this.rooms = new Map();
    this.users = new Map();
    this.config = {
      defaultBidIncrement: 1,
    };
  }

  static getInstance() {
    if (!AuctionSystem.instance) {
      AuctionSystem.instance = new AuctionSystem();
    }
    return AuctionSystem.instance;
  }

  registerRoom(room) {
    if (room && room.id != null) {
      this.rooms.set(room.id, room);
    }
  }

  registerUser(user) {
    if (user && user.id != null) {
      this.users.set(user.id, user);
    }
  }

  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  getUser(userId) {
    return this.users.get(userId) || null;
  }

  setConfig(partial) {
    this.config = { ...this.config, ...partial };
  }

  getConfig() {
    return { ...this.config };
  }
}

module.exports = AuctionSystem;
