const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const organizer = await prisma.organizer.findFirst();

  if (organizer) {
    console.log(`Organizer already exists with ID ${organizer.id}`);
    return;
  }

  const createdOrganizer = await prisma.organizer.create({
    data: {
      name: 'Default Organizer',
      email: 'organizer@example.com',
    },
  });

  console.log(`Created organizer with ID ${createdOrganizer.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });