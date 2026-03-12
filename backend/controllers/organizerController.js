const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function ensureDefaultOrganizer() {
  const existingOrganizer = await prisma.organizer.findFirst();
  if (existingOrganizer) return existingOrganizer;
  return prisma.organizer.create({
    data: { name: 'Default Organizer', email: 'organizer@example.com' },
  });
}

exports.getOrganizer = async (req, res) => {
  const organizer = await ensureDefaultOrganizer();
  res.json(organizer);
};

exports.getTest = async (req, res) => {
  const organizer = await ensureDefaultOrganizer();
  res.json({ message: 'Auction backend is running!', organizer });
};

exports.ensureDefaultOrganizer = ensureDefaultOrganizer;
