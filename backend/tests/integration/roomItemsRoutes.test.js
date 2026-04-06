const request = require('supertest');
const { createApp } = require('../../app');
const prisma = require('../../lib/prisma');
const AuctionFactory = require('../../lib/auctionFactory');
const roomController = require('../../controllers/roomController');

jest.mock('../../lib/prisma', () => ({
  auctionRoom: {
    findUnique: jest.fn(),
  },
}));

jest.mock('../../lib/auctionFactory', () => ({
  createItem: jest.fn(),
}));

jest.mock('../../controllers/roomController', () => {
  const actual = jest.requireActual('../../controllers/roomController');
  return {
    ...actual,
    emitRoomUpdate: jest.fn(),
  };
});

describe('Integration: item routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/rooms/:roomId/items creates item', async () => {
    // Tests add-item flow through the route and controller.
    prisma.auctionRoom.findUnique.mockResolvedValue({ id: 1 });
    AuctionFactory.createItem.mockResolvedValue({ id: 2, name: 'Watch' });

    const app = createApp();
    const response = await request(app)
      .post('/api/rooms/1/items')
      .send({ name: 'Watch', price: 10 });

    expect(roomController.emitRoomUpdate).toHaveBeenCalledWith(1);
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Watch');
  });
});
