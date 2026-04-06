const { placeBid } = require('../bidController');
const bidProcessor = require('../../lib/bidProcessor');

jest.mock('../../lib/bidProcessor', () => ({
  processBid: jest.fn(),
}));

const makeRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe('bidController.placeBid', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns room when bid is processed successfully', async () => {
    const req = {
      params: { roomId: 'room-1' },
      body: {
        participantId: 'p-1',
        amount: 120,
        strategy: 'manual',
        increment: 5,
        maxBid: 200,
      },
    };
    const res = makeRes();

    bidProcessor.processBid.mockResolvedValue({
      ok: true,
      room: { id: 'room-1', highestBid: 120 },
    });

    await placeBid(req, res);

    expect(bidProcessor.processBid).toHaveBeenCalledWith({
      roomId: 'room-1',
      participantId: 'p-1',
      amount: 120,
      strategy: 'manual',
      increment: 5,
      maxBid: 200,
    });
    expect(res.json).toHaveBeenCalledWith({ id: 'room-1', highestBid: 120 });
  });

  it('returns error and status when bid fails', async () => {
    const req = {
      params: { roomId: 'room-2' },
      body: {
        participantId: 'p-2',
        amount: 80,
        strategy: 'manual',
      },
    };
    const res = makeRes();

    bidProcessor.processBid.mockResolvedValue({
      ok: false,
      status: 409,
      error: 'Bid too low',
    });

    await placeBid(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Bid too low' });
  });
});
