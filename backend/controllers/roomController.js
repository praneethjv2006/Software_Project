const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ensureDefaultOrganizer } = require('./organizerController');

exports.getRooms = async (req, res) => {
  const organizer = await ensureDefaultOrganizer();
  const rooms = await prisma.auctionRoom.findMany({
    where: { organizerId: organizer.id },
    include: { participants: true, items: true },
    orderBy: { id: 'asc' },
  });
  res.json(rooms);
};

exports.createRoom = async (req, res) => {
  const organizer = await ensureDefaultOrganizer();
  const { roomName } = req.body;
  if (!roomName || !roomName.trim()) {
    return res.status(400).json({ error: 'roomName is required' });
  }
  const room = await prisma.auctionRoom.create({
    data: { roomName: roomName.trim(), organizerId: organizer.id },
  });
  return res.status(201).json(room);
};

exports.getRoom = async (req, res) => {
  const roomId = Number(req.params.roomId);
  if (Number.isNaN(roomId)) {
    return res.status(400).json({ error: 'Invalid room id' });
  }
  const room = await prisma.auctionRoom.findUnique({
    where: { id: roomId },
    include: {
      participants: { orderBy: { id: 'asc' } },
      items: { orderBy: { id: 'asc' } },
    },
  });
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  return res.json(room);
};
