const request = require('supertest');
const { createApp } = require('../../app');
const prisma = require('../../lib/prisma');
const AuctionFactory = require('../../lib/auctionFactory');

jest.mock('../../lib/prisma', () => ({
  organizer: {
    findUnique: jest.fn(),
  },
  auctionRoom: {
    findUnique: jest.fn(),
  },
}));

jest.mock('../../lib/auctionFactory', () => ({
  createAuctionRoom: jest.fn(),
}));

describe('Integration: room routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/rooms validates room name', async () => {
    // Tests validation at the route level.
    const app = createApp();
    const response = await request(app).post('/api/rooms').send({ roomName: ' ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('roomName is required');
  });

  it('POST /api/rooms creates room', async () => {
    // Tests room creation with organizer lookup.
    prisma.organizer.findUnique.mockResolvedValue({ id: 1 });
    AuctionFactory.createAuctionRoom.mockResolvedValue({ id: 5, roomName: 'Room A' });

    const app = createApp();
    const response = await request(app)
      .post('/api/rooms')
      .send({ roomName: 'Room A', organizerId: 1 });

    expect(response.status).toBe(201);
    expect(response.body.roomName).toBe('Room A');
  });

  it('GET /api/rooms/:roomId rejects invalid id', async () => {
    // Tests room fetch validation.
    const app = createApp();
    const response = await request(app).get('/api/rooms/bad');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid room id');
  });
});
