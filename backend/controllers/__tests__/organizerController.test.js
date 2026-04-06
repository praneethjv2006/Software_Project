const organizerController = require('../organizerController');
const prisma = require('../../lib/prisma');
const codeGenerator = require('../../lib/codeGenerator');

jest.mock('../../lib/prisma', () => ({
  organizer: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../lib/codeGenerator', () => ({
  generateUniqueCode: jest.fn(),
}));

const makeRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe('organizerController.ensureDefaultOrganizer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns existing organizer if present', async () => {
    // Tests early return when default organizer exists.
    prisma.organizer.findFirst.mockResolvedValue({ id: 1, name: 'Default Organizer' });

    const organizer = await organizerController.ensureDefaultOrganizer();

    expect(organizer).toEqual({ id: 1, name: 'Default Organizer' });
    expect(prisma.organizer.create).not.toHaveBeenCalled();
  });

  it('creates organizer when none exists', async () => {
    // Tests creation of a new default organizer.
    prisma.organizer.findFirst.mockResolvedValue(null);
    codeGenerator.generateUniqueCode.mockResolvedValue('1234');
    prisma.organizer.create.mockResolvedValue({ id: 1, organizerCode: '1234' });

    const organizer = await organizerController.ensureDefaultOrganizer();

    expect(codeGenerator.generateUniqueCode).toHaveBeenCalledWith(4, 'organizer', 'organizerCode');
    expect(prisma.organizer.create).toHaveBeenCalled();
    expect(organizer).toEqual({ id: 1, organizerCode: '1234' });
  });
});

describe('organizerController.loginOrganizer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid organizer code length', async () => {
    // Tests validation for organizer code length.
    const req = { body: { organizerCode: '12' } };
    const res = makeRes();

    await organizerController.loginOrganizer(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Organizer ID must be 4 digits' });
  });

  it('returns 404 when organizer is not found', async () => {
    // Tests missing organizer handling.
    const req = { body: { organizerCode: '1234' } };
    const res = makeRes();

    prisma.organizer.findUnique.mockResolvedValue(null);

    await organizerController.loginOrganizer(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Organizer not found' });
  });

  it('returns organizer when found', async () => {
    // Tests success path for organizer login.
    const req = { body: { organizerCode: '1234' } };
    const res = makeRes();

    prisma.organizer.findUnique.mockResolvedValue({ id: 7, name: 'Org' });

    await organizerController.loginOrganizer(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 7, name: 'Org' });
  });
});
