const http = require('http');
const { attachSocket } = require('./socket');
const { ensureDefaultOrganizer } = require('./controllers/organizerController');
const { createApp } = require('./app');

const app = createApp();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

attachSocket(server);

ensureDefaultOrganizer().catch((error) => {
  console.error('Failed to ensure default organizer', error);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});


