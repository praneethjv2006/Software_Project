const { addItem } = require('../itemController');
const prisma = require('../../lib/prisma');
const AuctionFactory = require('../../lib/auctionFactory');
const roomController = require('../roomController');

jest.mock('../../lib/prisma', () => ({
  auctionRoom: {
    findUnique: jest.fn(),
  },
}));

jest.mock('../../lib/auctionFactory', () => ({
  createItem: jest.fn(),
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

describe('itemController.addItem', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid room id', async () => {
    // Tests validation for invalid room id input.
    const req = { params: { roomId: 'abc' }, body: { name: 'Watch', price: 10 } };
    const res = makeRes();

    await addItem(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid room id' });
  });

  it('rejects missing item name', async () => {
    // Tests validation for item name requirement.
    const req = { params: { roomId: '1' }, body: { name: ' ', price: 10 } };
    const res = makeRes();

    await addItem(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Item name is required' });
  });

  it('rejects invalid price', async () => {
    // Tests validation for invalid price input.
    const req = { params: { roomId: '1' }, body: { name: 'Watch', price: 'bad' } };
    const res = makeRes();

    await addItem(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Valid price is required' });
  });

  it('returns 404 when room is not found', async () => {
    // Tests missing room handling.
    const req = { params: { roomId: '1' }, body: { name: 'Watch', price: 10 } };
    const res = makeRes();

    prisma.auctionRoom.findUnique.mockResolvedValue(null);

    await addItem(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Room not found' });
  });

  it('creates item and emits room update', async () => {
    // Tests success path with item creation and room update emission.
    const req = { params: { roomId: '1' }, body: { name: ' Watch ', price: 10 } };
    const res = makeRes();

    prisma.auctionRoom.findUnique.mockResolvedValue({ id: 1 });
    AuctionFactory.createItem.mockResolvedValue({ id: 99, name: 'Watch' });

    await addItem(req, res);

    expect(AuctionFactory.createItem).toHaveBeenCalledWith({
      name: 'Watch',
      price: 10,
      roomId: 1,
    });
    expect(roomController.emitRoomUpdate).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 99, name: 'Watch' });
  });
});
