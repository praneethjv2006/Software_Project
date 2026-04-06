const request = require('supertest');
const { createApp } = require('../../app');
const prisma = require('../../lib/prisma');

jest.mock('../../lib/prisma', () => ({
  participant: {
    findFirst: jest.fn(),
  },
}));

describe('Integration: participant routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/participants/login rejects invalid code', async () => {
    // Tests participant login validation through the route.
    const app = createApp();
    const response = await request(app)
      .post('/api/participants/login')
      .send({ participantCode: '123', roomId: '1' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Participant ID must be 6 digits');
  });

  it('POST /api/participants/login returns participant', async () => {
    // Tests login route -> prisma lookup.
    prisma.participant.findFirst.mockResolvedValue({ id: 3, name: 'Sam' });

    const app = createApp();
    const response = await request(app)
      .post('/api/participants/login')
      .send({ participantCode: '123456', roomId: '1' });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(3);
  });
});
