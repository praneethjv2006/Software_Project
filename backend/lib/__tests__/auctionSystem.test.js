const AuctionSystem = require('../auctionSystem');

describe('AuctionSystem', () => {
  it('registers and retrieves rooms', () => {
    // Tests room registration and lookup by id.
    const system = new AuctionSystem();
    system.registerRoom({ id: 1, roomName: 'A' });
    expect(system.getRoom(1)).toEqual({ id: 1, roomName: 'A' });
  });

  it('registers and retrieves users', () => {
    // Tests user registration and lookup by id.
    const system = new AuctionSystem();
    system.registerUser({ id: 2, name: 'Sam' });
    expect(system.getUser(2)).toEqual({ id: 2, name: 'Sam' });
  });

  it('merges config updates', () => {
    // Tests config merging behavior.
    const system = new AuctionSystem();
    system.setConfig({ defaultBidIncrement: 5 });
    expect(system.getConfig().defaultBidIncrement).toBe(5);
  });
});
