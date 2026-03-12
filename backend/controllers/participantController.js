const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addParticipant = async (req, res) => {
  const roomId = Number(req.params.roomId);
  const { name, purseAmount } = req.body;
  if (Number.isNaN(roomId)) {
    return res.status(400).json({ error: 'Invalid room id' });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Participant name is required' });
  }
  const parsedPurseAmount = Number(purseAmount);
  if (Number.isNaN(parsedPurseAmount) || parsedPurseAmount < 0) {
    return res.status(400).json({ error: 'Valid purseAmount is required' });
  }
  const room = await prisma.auctionRoom.findUnique({ where: { id: roomId } });
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  const participant = await prisma.participant.create({
    data: {
      name: name.trim(),
      purseAmount: parsedPurseAmount,
      remainingPurse: parsedPurseAmount,
      roomId,
    },
  });
  return res.status(201).json(participant);
};
