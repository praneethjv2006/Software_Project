const request = require('supertest');
const { createApp } = require('../../app');
const bidProcessor = require('../../lib/bidProcessor');

jest.mock('../../lib/bidProcessor', () => ({
  processBid: jest.fn(),
}));

describe('Integration: bid routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/rooms/:roomId/bids returns error', async () => {
    // Tests error response passthrough from bid processor.
    bidProcessor.processBid.mockResolvedValue({ ok: false, status: 400, error: 'Invalid bid' });

    const app = createApp();
    const response = await request(app)
      .post('/api/rooms/1/bids')
      .send({ participantId: 1, amount: 1 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid bid');
  });

  it('POST /api/rooms/:roomId/bids returns room', async () => {
    // Tests success response passthrough from bid processor.
    bidProcessor.processBid.mockResolvedValue({ ok: true, room: { id: 1 } });

    const app = createApp();
    const response = await request(app)
      .post('/api/rooms/1/bids')
      .send({ participantId: 1, amount: 1 });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
  });
});
