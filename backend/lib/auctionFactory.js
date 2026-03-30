const prisma = require('./prisma');
const AuctionSystem = require('./auctionSystem');
const { generateUniqueCode } = require('./codeGenerator');

const auctionSystem = AuctionSystem.getInstance();

class AuctionFactory {
  static async createAuctionRoom({ roomName, organizerId }) {
    const room = await prisma.auctionRoom.create({
      data: { roomName, organizerId },
    });
    auctionSystem.registerRoom(room);
    return room;
  }

  static async createParticipant({ name, purseAmount, roomId }) {
    const participantCode = await generateUniqueCode(6, 'participant', 'participantCode');
    const participant = await prisma.participant.create({
      data: {
        name,
        participantCode,
        purseAmount,
        remainingPurse: purseAmount,
        roomId,
      },
    });
    auctionSystem.registerUser(participant);
    return participant;
  }

  static async createItem({ name, price, roomId }) {
    return prisma.item.create({
      data: {
        name,
        price,
        firstBid: price,
        currentBid: price,
        status: 'upcoming',
        auctionRoomId: roomId,
      },
    });
  }

  static createBid({ amount, participantId, itemId }) {
    return prisma.bid.create({
      data: {
        amount,
        participantId,
        itemId,
      },
    });
  }
}

module.exports = AuctionFactory;
