const roomController = require('../roomController');
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

const makeRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe('roomController.getRoom', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid room id', async () => {
    // Tests validation for invalid room id.
    const req = { params: { roomId: 'bad' } };
    const res = makeRes();

    await roomController.getRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid room id' });
  });

  it('returns 404 when room not found', async () => {
    // Tests missing room handling.
    const req = { params: { roomId: '1' } };
    const res = makeRes();

    prisma.auctionRoom.findUnique.mockResolvedValue(null);

    await roomController.getRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Room not found' });
  });
});

describe('roomController.createRoom', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects missing room name', async () => {
    // Tests validation for required room name.
    const req = { body: { roomName: ' ' } };
    const res = makeRes();

    await roomController.createRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'roomName is required' });
  });

  it('returns 404 when organizer not found', async () => {
    // Tests missing organizer handling.
    const req = { body: { roomName: 'Room A', organizerId: 9 } };
    const res = makeRes();

    prisma.organizer.findUnique.mockResolvedValue(null);

    await roomController.createRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Organizer not found' });
  });

  it('creates room when organizer exists', async () => {
    // Tests success path for room creation.
    const req = { body: { roomName: 'Room A', organizerId: 9 } };
    const res = makeRes();

    prisma.organizer.findUnique.mockResolvedValue({ id: 9 });
    AuctionFactory.createAuctionRoom.mockResolvedValue({ id: 1, roomName: 'Room A' });

    await roomController.createRoom(req, res);

    expect(AuctionFactory.createAuctionRoom).toHaveBeenCalledWith({ roomName: 'Room A', organizerId: 9 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1, roomName: 'Room A' });
  });
});

describe('roomController.startAuction', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid room id', async () => {
    // Tests validation for invalid room id.
    const req = { params: { roomId: 'bad' } };
    const res = makeRes();

    await roomController.startAuction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid room id' });
  });

  it('rejects when auction already live', async () => {
    // Tests protection against starting an already live auction.
    const req = { params: { roomId: '1' } };
    const res = makeRes();

    prisma.auctionRoom.findUnique.mockResolvedValue({ id: 1, status: 'live' });

    await roomController.startAuction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Auction already live' });
  });
});

describe('roomController.configureAutoAuction', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid bid window seconds', async () => {
    // Tests validation for bid window configuration.
    const req = { params: { roomId: '1' }, body: { enabled: true, bidWindowSeconds: 1 } };
    const res = makeRes();

    prisma.auctionRoom.findUnique.mockResolvedValue({ id: 1 });

    await roomController.configureAutoAuction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'bidWindowSeconds must be at least 3 seconds' });
  });
});
