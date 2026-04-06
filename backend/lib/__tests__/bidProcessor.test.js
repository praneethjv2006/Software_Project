const { processBid } = require('../bidProcessor');
const prisma = require('../prisma');

jest.mock('../prisma', () => ({
  participant: {
    findUnique: jest.fn(),
  },
  auctionRoom: {
    findUnique: jest.fn(),
  },
  item: {
    findUnique: jest.fn(),
  },
}));

jest.mock('../auctionFactory', () => ({
  createBid: jest.fn(),
}));

jest.mock('../biddingStrategies', () => ({
  getBiddingStrategy: jest.fn(),
}));

jest.mock('../itemState', () => ({
  getItemState: jest.fn(),
  ItemStatuses: { IN_PROGRESS: 'ongoing' },
}));

jest.mock('../../controllers/roomController', () => ({
  getRoomSnapshot: jest.fn(),
  handleBidPlaced: jest.fn(),
}));

describe('bidProcessor.processBid', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid room id', async () => {
    // Tests validation for room id input.
    const result = await processBid({ roomId: 'bad', participantId: 1, amount: 1 });
    expect(result).toEqual({ ok: false, status: 400, error: 'Invalid room id' });
  });

  it('rejects when participant is not found', async () => {
    // Tests missing participant handling.
    prisma.participant.findUnique.mockResolvedValue(null);

    const result = await processBid({ roomId: 1, participantId: 99, amount: 1 });

    expect(result).toEqual({ ok: false, status: 404, error: 'Participant not found in room' });
  });
});
