const request = require('supertest');
const { createApp } = require('../../app');
const prisma = require('../../lib/prisma');
const codeGenerator = require('../../lib/codeGenerator');

jest.mock('../../lib/prisma', () => ({
  organizer: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../lib/codeGenerator', () => ({
  generateUniqueCode: jest.fn(),
}));

describe('Integration: organizer routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/organizer returns default organizer', async () => {
    // Tests route -> controller -> prisma flow for default organizer.
    prisma.organizer.findFirst.mockResolvedValue(null);
    codeGenerator.generateUniqueCode.mockResolvedValue('1234');
    prisma.organizer.create.mockResolvedValue({ id: 1, organizerCode: '1234' });

    const app = createApp();
    const response = await request(app).get('/api/organizer');

    expect(response.status).toBe(200);
    expect(response.body.organizerCode).toBe('1234');
  });

  it('POST /api/organizer/login returns organizer', async () => {
    // Tests login route payload validation and handler integration.
    prisma.organizer.findUnique.mockResolvedValue({ id: 2, organizerCode: '5678' });

    const app = createApp();
    const response = await request(app)
      .post('/api/organizer/login')
      .send({ organizerCode: '5678' });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(2);
  });
});
