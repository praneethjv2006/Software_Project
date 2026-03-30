const prisma = require('./prisma');
const AuctionFactory = require('./auctionFactory');
const { getBiddingStrategy } = require('./biddingStrategies');
const { getItemState, ItemStatuses } = require('./itemState');
const { getRoomSnapshot, handleBidPlaced } = require('../controllers/roomController');

async function processBid({ roomId, participantId, amount, strategy, increment, maxBid }) {
  const parsedRoomId = Number(roomId);
  const parsedParticipantId = Number(participantId);

  if (Number.isNaN(parsedRoomId)) {
    return { ok: false, status: 400, error: 'Invalid room id' };
  }

  const participant = await prisma.participant.findUnique({
    where: { id: parsedParticipantId },
  });

  if (!participant || participant.roomId !== parsedRoomId) {
    return { ok: false, status: 404, error: 'Participant not found in room' };
  }

  const room = await prisma.auctionRoom.findUnique({ where: { id: parsedRoomId } });
  if (!room || !room.currentItemId) {
    return { ok: false, status: 400, error: 'No ongoing item to bid on' };
  }

  const item = await prisma.item.findUnique({ where: { id: room.currentItemId } });
  if (!item || item.status !== ItemStatuses.IN_PROGRESS) {
    return { ok: false, status: 400, error: 'Bidding is not open for this item' };
  }

  if (item.winnerId === participant.id) {
    return { ok: false, status: 400, error: 'You already have the highest bid' };
  }

  const biddingStrategy = getBiddingStrategy(strategy);
  let bidAmount;
  try {
    bidAmount = biddingStrategy.executeBid({
      amount,
      currentBid: item.currentBid,
      increment,
      maxBid,
    });
  } catch (error) {
    return { ok: false, status: 400, error: error.message || 'Invalid bid' };
  }

  if (item.currentBid != null && bidAmount <= item.currentBid) {
    return { ok: false, status: 400, error: 'Bid must be higher than current bid' };
  }

  if (bidAmount > participant.remainingPurse) {
    return { ok: false, status: 400, error: 'Bid exceeds remaining purse' };
  }

  const itemState = getItemState(item.status);
  const itemUpdate = itemState.updateBid({ amount: bidAmount, participantId: participant.id });

  await prisma.$transaction([
    AuctionFactory.createBid({ amount: bidAmount, participantId: participant.id, itemId: item.id }),
    prisma.item.update({
      where: { id: item.id },
      data: itemUpdate,
    }),
  ]);

  await handleBidPlaced(parsedRoomId, {
    roomId: parsedRoomId,
    itemId: item.id,
    amount: bidAmount,
    participantId: participant.id,
    currentBid: bidAmount,
  });

  const updatedRoom = await getRoomSnapshot(parsedRoomId);
  return { ok: true, room: updatedRoom };
}

module.exports = { processBid };
