const express = require('express');
const cors = require('cors');
const organizerRoutes = require('./routes/organizerRoutes');
const participantRoutes = require('./routes/participantRoutes');
const roomRoutes = require('./routes/roomRoutes');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/organizer', organizerRoutes);
  app.use('/api/participants', participantRoutes);
  app.use('/api/rooms', roomRoutes);

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
