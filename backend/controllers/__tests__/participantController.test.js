const { addParticipant, loginParticipant } = require('../participantController');
const prisma = require('../../lib/prisma');
const AuctionFactory = require('../../lib/auctionFactory');
const roomController = require('../roomController');

jest.mock('../../lib/prisma', () => ({
  auctionRoom: {
    findUnique: jest.fn(),
  },
  participant: {
    findFirst: jest.fn(),
  },
}));

jest.mock('../../lib/auctionFactory', () => ({
  createParticipant: jest.fn(),
}));

jest.mock('../roomController', () => ({
  emitRoomUpdate: jest.fn(),
}));

const makeRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe('participantController.addParticipant', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid room id', async () => {
    // Tests validation for invalid room id.
    const req = { params: { roomId: 'bad' }, body: { name: 'Sam', purseAmount: 10 } };
    const res = makeRes();

    await addParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid room id' });
  });

  it('rejects missing participant name', async () => {
    // Tests validation for participant name requirement.
    const req = { params: { roomId: '1' }, body: { name: ' ', purseAmount: 10 } };
    const res = makeRes();

    await addParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Participant name is required' });
  });

  it('rejects invalid purse amount', async () => {
    // Tests validation for purse amount requirement.
    const req = { params: { roomId: '1' }, body: { name: 'Sam', purseAmount: 'bad' } };
    const res = makeRes();

    await addParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Valid purseAmount is required' });
  });

  it('returns 404 when room is not found', async () => {
    // Tests missing room handling.
    const req = { params: { roomId: '1' }, body: { name: 'Sam', purseAmount: 10 } };
    const res = makeRes();

    prisma.auctionRoom.findUnique.mockResolvedValue(null);

    await addParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Room not found' });
  });

  it('creates participant and emits room update', async () => {
    // Tests success path for participant creation.
    const req = { params: { roomId: '1' }, body: { name: ' Sam ', purseAmount: 10 } };
    const res = makeRes();

    prisma.auctionRoom.findUnique.mockResolvedValue({ id: 1 });
    AuctionFactory.createParticipant.mockResolvedValue({ id: 9, name: 'Sam' });

    await addParticipant(req, res);

    expect(AuctionFactory.createParticipant).toHaveBeenCalledWith({
      name: 'Sam',
      purseAmount: 10,
      roomId: 1,
    });
    expect(roomController.emitRoomUpdate).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 9, name: 'Sam' });
  });
});

describe('participantController.loginParticipant', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid participant code', async () => {
    // Tests validation for participant code length.
    const req = { body: { participantCode: '123', roomId: '1' } };
    const res = makeRes();

    await loginParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Participant ID must be 6 digits' });
  });

  it('rejects missing room id', async () => {
    // Tests validation for required room id.
    const req = { body: { participantCode: '123456', roomId: 'bad' } };
    const res = makeRes();

    await loginParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Room ID is required' });
  });

  it('returns 404 when participant is not found', async () => {
    // Tests missing participant handling.
    const req = { body: { participantCode: '123456', roomId: '1' } };
    const res = makeRes();

    prisma.participant.findFirst.mockResolvedValue(null);

    await loginParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Participant not found' });
  });

  it('returns participant when login succeeds', async () => {
    // Tests success path for participant login.
    const req = { body: { participantCode: '123456', roomId: '1' } };
    const res = makeRes();

    prisma.participant.findFirst.mockResolvedValue({ id: 2, name: 'Sam' });

    await loginParticipant(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 2, name: 'Sam' });
  });
});
